export interface StoredPhoto {
  key: string;
  isPrimary: boolean;
}

export function primaryPhotoKey(photos: StoredPhoto[]): string | null {
  return (photos.find((photo) => photo.isPrimary) ?? photos[0])?.key ?? null;
}

export function photoKeysPrimaryFirst(photos: StoredPhoto[]): string[] {
  return [
    ...photos.filter((photo) => photo.isPrimary),
    ...photos.filter((photo) => !photo.isPrimary),
  ].map((photo) => photo.key);
}
