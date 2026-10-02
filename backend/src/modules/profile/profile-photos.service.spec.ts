import { StorageService } from '../storage/storage.service';
import { ProfilePhotosService } from './profile-photos.service';

function file(name: string): Express.Multer.File {
  return {
    originalname: name,
    mimetype: 'image/jpeg',
    buffer: Buffer.from(name),
  } as Express.Multer.File;
}

const NO_PHOTOS = new Map<string, string>();
const OWNED = new Map([['photo-1', 'profiles/old.jpg']]);

function setup() {
  const storage = {
    uploadImage: jest
      .fn()
      .mockImplementation((uploaded: Express.Multer.File) =>
        Promise.resolve(`profiles/${uploaded.originalname}`),
      ),
    deleteImage: jest.fn().mockResolvedValue(undefined),
  };
  return {
    service: new ProfilePhotosService(storage as unknown as StorageService),
    storage,
  };
}

describe('ProfilePhotosService', () => {
  describe('resolveKeys', () => {
    it('uploads every file when there is no manifest', async () => {
      const { service } = setup();

      const keys = await service.resolveKeys(
        undefined,
        [file('a.jpg'), file('b.jpg')],
        NO_PHOTOS,
      );

      expect(keys).toEqual(['profiles/a.jpg', 'profiles/b.jpg']);
    });

    it('requires at least one photo', async () => {
      const { service } = setup();

      await expect(
        service.resolveKeys(undefined, [], NO_PHOTOS),
      ).rejects.toThrow('At least one photo is required.');
    });

    it('caps the number of photos', async () => {
      const { service } = setup();
      const files = Array.from({ length: 6 }, (_, index) =>
        file(`${index}.jpg`),
      );

      await expect(
        service.resolveKeys(undefined, files, NO_PHOTOS),
      ).rejects.toThrow('At most 5 photos are allowed.');
    });

    it('keeps an existing photo the profile owns, by photo id', async () => {
      const { service, storage } = setup();

      const keys = await service.resolveKeys(
        JSON.stringify(['keep:photo-1']),
        [],
        OWNED,
      );

      expect(keys).toEqual(['profiles/old.jpg']);
      expect(storage.uploadImage).not.toHaveBeenCalled();
    });

    it('refuses to keep a photo the profile does not own', async () => {
      const { service } = setup();

      await expect(
        service.resolveKeys(
          JSON.stringify(['keep:someone-elses-photo']),
          [],
          OWNED,
        ),
      ).rejects.toThrow('Invalid photo reference.');
    });

    it('refuses a url where a photo id belongs', async () => {
      const { service } = setup();

      await expect(
        service.resolveKeys(
          JSON.stringify(['keep:https://storage.googleapis.com/x/old.jpg']),
          [],
          OWNED,
        ),
      ).rejects.toThrow('Invalid photo reference.');
    });

    it('interleaves kept photos and new uploads in manifest order', async () => {
      const { service } = setup();

      const keys = await service.resolveKeys(
        JSON.stringify(['new', 'keep:photo-1', 'new']),
        [file('a.jpg'), file('b.jpg')],
        OWNED,
      );

      expect(keys).toEqual([
        'profiles/a.jpg',
        'profiles/old.jpg',
        'profiles/b.jpg',
      ]);
    });

    it('rejects a manifest promising more files than were sent', async () => {
      const { service } = setup();

      await expect(
        service.resolveKeys(
          JSON.stringify(['new', 'new']),
          [file('a.jpg')],
          NO_PHOTOS,
        ),
      ).rejects.toThrow('A photo file is missing.');
    });

    it('falls back to uploading everything on malformed manifest json', async () => {
      const { service } = setup();

      const keys = await service.resolveKeys(
        'not-json',
        [file('a.jpg')],
        NO_PHOTOS,
      );

      expect(keys).toEqual(['profiles/a.jpg']);
    });

    it('ignores non string entries in the manifest', async () => {
      const { service } = setup();

      const keys = await service.resolveKeys(
        JSON.stringify([1, 'new']),
        [file('a.jpg')],
        NO_PHOTOS,
      );

      expect(keys).toEqual(['profiles/a.jpg']);
    });

    it('falls back to uploading everything when the manifest is not an array', async () => {
      const { service } = setup();

      const keys = await service.resolveKeys(
        JSON.stringify({ nope: true }),
        [file('a.jpg')],
        NO_PHOTOS,
      );

      expect(keys).toEqual(['profiles/a.jpg']);
    });
  });

  describe('removeUnused', () => {
    it('deletes only the photos that were dropped', async () => {
      const { service, storage } = setup();

      await service.removeUnused(
        ['profiles/a.jpg', 'profiles/b.jpg'],
        ['profiles/a.jpg'],
      );

      expect(storage.deleteImage).toHaveBeenCalledTimes(1);
      expect(storage.deleteImage).toHaveBeenCalledWith('profiles/b.jpg');
    });

    it('deletes nothing when every photo was kept', async () => {
      const { service, storage } = setup();

      await service.removeUnused(['profiles/a.jpg'], ['profiles/a.jpg']);

      expect(storage.deleteImage).not.toHaveBeenCalled();
    });
  });
});
