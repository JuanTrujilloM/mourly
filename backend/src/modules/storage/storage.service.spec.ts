import { Logger } from '@nestjs/common';
import { StorageService } from './storage.service';
import type { ImageStore } from './image-store';

function fileWith(
  mimetype: string,
  originalname = 'photo',
): Express.Multer.File {
  return {
    mimetype,
    originalname,
    buffer: Buffer.from('data'),
  } as Express.Multer.File;
}

function setup() {
  const store = {
    save: jest.fn().mockResolvedValue('https://cdn/profiles/x.jpg'),
    remove: jest.fn().mockResolvedValue(undefined),
  } satisfies ImageStore;
  return { service: new StorageService(store), store };
}

describe('StorageService', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('derives the extension from the mime type, not the file name', async () => {
    const { service, store } = setup();

    await service.uploadImage(fileWith('image/png', 'payload.html'));

    const key = store.save.mock.calls[0][0] as string;
    expect(key.endsWith('.png')).toBe(true);
    expect(key).not.toContain('html');
  });

  it('namespaces uploads under profiles with a random id', async () => {
    const { service, store } = setup();

    await service.uploadImage(fileWith('image/jpeg'));

    const key = store.save.mock.calls[0][0] as string;
    expect(key).toMatch(/^profiles\/[0-9a-f-]{36}\.jpg$/);
  });

  it('returns the url the store produced', async () => {
    const { service } = setup();

    expect(await service.uploadImage(fileWith('image/webp'))).toBe(
      'https://cdn/profiles/x.jpg',
    );
  });

  it('refuses a mime type outside the allowlist', async () => {
    const { service } = setup();

    await expect(service.uploadImage(fileWith('text/html'))).rejects.toThrow(
      /Unsupported image mime type/,
    );
  });

  it('deletes through the store', async () => {
    const { service, store } = setup();

    await service.deleteImage('https://cdn/profiles/x.jpg');

    expect(store.remove).toHaveBeenCalledWith('https://cdn/profiles/x.jpg');
  });

  it('never lets a failed delete bubble up', async () => {
    const { service, store } = setup();
    store.remove.mockRejectedValue(new Error('gone'));

    await expect(
      service.deleteImage('https://cdn/profiles/x.jpg'),
    ).resolves.toBeUndefined();
    expect(Logger.prototype.warn).toHaveBeenCalled();
  });
});
