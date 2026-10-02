import { StorageService } from './storage.service';
import { PhotoUrlService } from './photo-url.service';
import type { ImageStore } from './image-store';

export function fileWith(
  mimetype: string,
  originalname = 'photo',
): Express.Multer.File {
  return {
    mimetype,
    originalname,
    buffer: Buffer.from('data'),
  } as Express.Multer.File;
}

export function setupStorageService() {
  const store = {
    save: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    urlFor: jest.fn((key: string, lifetime: string) =>
      Promise.resolve(`https://signed/${lifetime}/${key}`),
    ),
  } satisfies ImageStore;
  return { service: new StorageService(store), store };
}

export function setupPhotoUrlService() {
  const { service, store } = setupStorageService();
  return { photoUrls: new PhotoUrlService(service), store };
}
