import type { ChangeEvent } from 'react';
import type { ProfilePhoto } from '@/types/profile';

export function buildPhotoListActions(
  photos: ProfilePhoto[],
  maxPhotos: number,
  onChange: (next: ProfilePhoto[]) => void,
) {
  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? []);
    const room = maxPhotos - photos.length;
    const next: ProfilePhoto[] = incoming.slice(0, room).map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      file,
    }));
    onChange([...photos, ...next]);
    event.target.value = '';
  };

  const removeAt = (index: number) => {
    const target = photos[index];
    if (target.file) URL.revokeObjectURL(target.url);
    onChange(photos.filter((_, position) => position !== index));
  };

  const reorder = (from: number, to: number) => {
    const next = [...photos];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return { addFiles, removeAt, reorder };
}
