import { photoKeysPrimaryFirst, primaryPhotoKey } from './photo-order';

const PHOTOS = [
  { key: 'profiles/a.jpg', isPrimary: false },
  { key: 'profiles/b.jpg', isPrimary: true },
  { key: 'profiles/c.jpg', isPrimary: false },
];

describe('primaryPhotoKey', () => {
  it('picks the photo flagged as primary', () => {
    expect(primaryPhotoKey(PHOTOS)).toBe('profiles/b.jpg');
  });

  it('falls back to the first photo when none is flagged', () => {
    const photos = PHOTOS.map((photo) => ({ ...photo, isPrimary: false }));

    expect(primaryPhotoKey(photos)).toBe('profiles/a.jpg');
  });

  it('returns null without photos', () => {
    expect(primaryPhotoKey([])).toBeNull();
  });
});

describe('photoKeysPrimaryFirst', () => {
  it('moves the primary photo to the front and keeps the rest in order', () => {
    expect(photoKeysPrimaryFirst(PHOTOS)).toEqual([
      'profiles/b.jpg',
      'profiles/a.jpg',
      'profiles/c.jpg',
    ]);
  });
});
