import { setupPhotoUrlService } from './storage.test-helpers';

function setup() {
  const { photoUrls, store } = setupPhotoUrlService();
  return { service: photoUrls, store };
}

const PHOTOS = [
  { key: 'profiles/a.jpg', isPrimary: false },
  { key: 'profiles/b.jpg', isPrimary: true },
];

describe('PhotoUrlService', () => {
  describe('primaryUrl', () => {
    it('signs only the primary photo with the requested lifetime', async () => {
      const { service, store } = setup();

      expect(await service.primaryUrl(PHOTOS, 'email')).toBe(
        'https://signed/email/profiles/b.jpg',
      );
      expect(store.urlFor).toHaveBeenCalledTimes(1);
    });

    it('returns null without photos', async () => {
      const { service, store } = setup();

      expect(await service.primaryUrl(undefined, 'page')).toBeNull();
      expect(await service.primaryUrl([], 'page')).toBeNull();
      expect(store.urlFor).not.toHaveBeenCalled();
    });
  });

  describe('orderedUrls', () => {
    it('signs every photo for a page, primary first', async () => {
      const { service } = setup();

      expect(await service.orderedUrls(PHOTOS)).toEqual([
        'https://signed/page/profiles/b.jpg',
        'https://signed/page/profiles/a.jpg',
      ]);
    });

    it('returns an empty list without photos', async () => {
      const { service } = setup();

      expect(await service.orderedUrls(undefined)).toEqual([]);
    });
  });

  describe('withSignedPhotos', () => {
    it('swaps each key for a page url and keeps the other fields', async () => {
      const { service } = setup();

      const profile = await service.withSignedPhotos({
        name: 'Ana',
        photos: [{ id: 'p1', key: 'profiles/a.jpg', isPrimary: true }],
      });

      expect(profile).toEqual({
        name: 'Ana',
        photos: [
          {
            id: 'p1',
            isPrimary: true,
            url: 'https://signed/page/profiles/a.jpg',
          },
        ],
      });
    });

    it('passes external photo urls through untouched', async () => {
      const { service } = setup();

      const profile = await service.withSignedPhotos({
        photos: [{ key: 'https://randomuser.me/a.jpg', isPrimary: true }],
      });

      expect(profile.photos[0].url).toBe('https://randomuser.me/a.jpg');
    });
  });
});
