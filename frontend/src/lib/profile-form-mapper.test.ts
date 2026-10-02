import { describe, expect, it } from 'vitest';
import { buildProfileFormData } from './profile-form-mapper';
import type { ProfileValues } from './validation/profile';

const VALUES: ProfileValues = {
  name: 'Ana',
  dateOfBirth: '2003-04-12',
  gender: 'Femenino',
  height: 166,
  photos: [],
  biography: 'Cine y café',
  major: 'Derecho',
  semester: '6',
};

function manifestOf(data: FormData): string[] {
  return JSON.parse(data.get('photoManifest') as string);
}

describe('buildProfileFormData', () => {
  it('keeps a saved photo by its id, since its signed url changes every hour', () => {
    const photos = [
      { id: 'photo-1', url: 'https://storage.googleapis.com/b/k.jpg?X-Goog-Signature=1' },
    ];

    const data = buildProfileFormData({ ...VALUES, photos });

    expect(manifestOf(data)).toEqual(['keep:photo-1']);
  });

  it('sends new files in manifest order next to the kept ones', () => {
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    const photos = [
      { id: 'tmp', url: 'blob:a', file },
      { id: 'photo-1', url: 'https://signed/k.jpg' },
    ];

    const data = buildProfileFormData({ ...VALUES, photos });

    expect(manifestOf(data)).toEqual(['new', 'keep:photo-1']);
    expect(data.getAll('photos')).toHaveLength(1);
  });
});
