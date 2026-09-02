import { StorageService } from '../storage/storage.service';
import { ProfilePhotosService } from './profile-photos.service';

function file(name: string): Express.Multer.File {
  return {
    originalname: name,
    mimetype: 'image/jpeg',
    buffer: Buffer.from(name),
  } as Express.Multer.File;
}

function setup() {
  const storage = {
    uploadImage: jest
      .fn()
      .mockImplementation((uploaded: Express.Multer.File) =>
        Promise.resolve(`https://cdn/${uploaded.originalname}`),
      ),
    deleteImage: jest.fn().mockResolvedValue(undefined),
  };
  return {
    service: new ProfilePhotosService(storage as unknown as StorageService),
    storage,
  };
}

describe('ProfilePhotosService', () => {
  describe('resolveUrls', () => {
    it('uploads every file when there is no manifest', async () => {
      const { service } = setup();

      const urls = await service.resolveUrls(
        undefined,
        [file('a.jpg'), file('b.jpg')],
        new Set(),
      );

      expect(urls).toEqual(['https://cdn/a.jpg', 'https://cdn/b.jpg']);
    });

    it('requires at least one photo', async () => {
      const { service } = setup();

      await expect(
        service.resolveUrls(undefined, [], new Set()),
      ).rejects.toThrow('At least one photo is required.');
    });

    it('caps the number of photos', async () => {
      const { service } = setup();
      const files = Array.from({ length: 6 }, (_, index) =>
        file(`${index}.jpg`),
      );

      await expect(
        service.resolveUrls(undefined, files, new Set()),
      ).rejects.toThrow('At most 5 photos are allowed.');
    });

    it('keeps an existing photo the profile already owns', async () => {
      const { service, storage } = setup();
      const owned = new Set(['https://cdn/old.jpg']);

      const urls = await service.resolveUrls(
        JSON.stringify(['keep:https://cdn/old.jpg']),
        [],
        owned,
      );

      expect(urls).toEqual(['https://cdn/old.jpg']);
      expect(storage.uploadImage).not.toHaveBeenCalled();
    });

    it('refuses to keep a photo the profile does not own', async () => {
      const { service } = setup();

      await expect(
        service.resolveUrls(
          JSON.stringify(['keep:https://cdn/someone-else.jpg']),
          [],
          new Set(),
        ),
      ).rejects.toThrow('Invalid photo reference.');
    });

    it('interleaves kept photos and new uploads in manifest order', async () => {
      const { service } = setup();
      const owned = new Set(['https://cdn/old.jpg']);

      const urls = await service.resolveUrls(
        JSON.stringify(['new', 'keep:https://cdn/old.jpg', 'new']),
        [file('a.jpg'), file('b.jpg')],
        owned,
      );

      expect(urls).toEqual([
        'https://cdn/a.jpg',
        'https://cdn/old.jpg',
        'https://cdn/b.jpg',
      ]);
    });

    it('rejects a manifest promising more files than were sent', async () => {
      const { service } = setup();

      await expect(
        service.resolveUrls(
          JSON.stringify(['new', 'new']),
          [file('a.jpg')],
          new Set(),
        ),
      ).rejects.toThrow('A photo file is missing.');
    });

    it('falls back to uploading everything on malformed manifest json', async () => {
      const { service } = setup();

      const urls = await service.resolveUrls(
        'not-json',
        [file('a.jpg')],
        new Set(),
      );

      expect(urls).toEqual(['https://cdn/a.jpg']);
    });

    it('ignores non string entries in the manifest', async () => {
      const { service } = setup();

      const urls = await service.resolveUrls(
        JSON.stringify([1, 'new']),
        [file('a.jpg')],
        new Set(),
      );

      expect(urls).toEqual(['https://cdn/a.jpg']);
    });

    it('falls back to uploading everything when the manifest is not an array', async () => {
      const { service } = setup();

      const urls = await service.resolveUrls(
        JSON.stringify({ nope: true }),
        [file('a.jpg')],
        new Set(),
      );

      expect(urls).toEqual(['https://cdn/a.jpg']);
    });
  });

  describe('removeUnused', () => {
    it('deletes only the photos that were dropped', async () => {
      const { service, storage } = setup();
      const owned = new Set(['https://cdn/a.jpg', 'https://cdn/b.jpg']);

      await service.removeUnused(owned, ['https://cdn/a.jpg']);

      expect(storage.deleteImage).toHaveBeenCalledTimes(1);
      expect(storage.deleteImage).toHaveBeenCalledWith('https://cdn/b.jpg');
    });

    it('deletes nothing when every photo was kept', async () => {
      const { service, storage } = setup();
      const owned = new Set(['https://cdn/a.jpg']);

      await service.removeUnused(owned, ['https://cdn/a.jpg']);

      expect(storage.deleteImage).not.toHaveBeenCalled();
    });
  });
});
