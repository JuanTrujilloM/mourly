import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPhotoListActions } from './photo-list-actions';
import type { ProfilePhoto } from '@/types/profile';

function photo(id: string, file?: File): ProfilePhoto {
  return { id, url: `blob:${id}`, file };
}

function changeEvent(files: File[]) {
  return {
    target: { files, value: 'x' },
  } as unknown as React.ChangeEvent<HTMLInputElement>;
}

describe('buildPhotoListActions', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: () => 'generated-id' });
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:new');
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  it('appends the dropped files', () => {
    const onChange = vi.fn();
    const actions = buildPhotoListActions([photo('a')], 5, onChange);

    actions.addFiles(changeEvent([new File([''], 'b.jpg')]));

    expect(onChange.mock.calls[0][0]).toHaveLength(2);
  });

  it('never exceeds the maximum number of photos', () => {
    const onChange = vi.fn();
    const existing = [photo('a'), photo('b')];
    const actions = buildPhotoListActions(existing, 3, onChange);

    actions.addFiles(
      changeEvent([new File([''], 'c.jpg'), new File([''], 'd.jpg')]),
    );

    expect(onChange.mock.calls[0][0]).toHaveLength(3);
  });

  it('clears the input so the same file can be picked again', () => {
    const event = changeEvent([new File([''], 'b.jpg')]);
    buildPhotoListActions([], 5, vi.fn()).addFiles(event);

    expect(event.target.value).toBe('');
  });

  it('removes a photo by index', () => {
    const onChange = vi.fn();
    const actions = buildPhotoListActions([photo('a'), photo('b')], 5, onChange);

    actions.removeAt(0);

    expect(onChange.mock.calls[0][0]).toEqual([photo('b')]);
  });

  it('releases the object url of a removed upload', () => {
    const uploaded = photo('a', new File([''], 'a.jpg'));
    buildPhotoListActions([uploaded], 5, vi.fn()).removeAt(0);

    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith('blob:a');
  });

  it('does not release the url of a photo that came from the server', () => {
    buildPhotoListActions([photo('a')], 5, vi.fn()).removeAt(0);

    expect(globalThis.URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it('reorders a photo to a later position', () => {
    const onChange = vi.fn();
    const actions = buildPhotoListActions(
      [photo('a'), photo('b'), photo('c')],
      5,
      onChange,
    );

    actions.reorder(0, 2);

    expect(
      (onChange.mock.calls[0][0] as ProfilePhoto[]).map((item) => item.id),
    ).toEqual(['b', 'c', 'a']);
  });
});
