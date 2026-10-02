import { Logger } from '@nestjs/common';
import { fileWith, setupStorageService as setup } from './storage.test-helpers';

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

  it('returns the key it stored', async () => {
    const { service, store } = setup();

    const key = await service.uploadImage(fileWith('image/png'));

    expect(key).toBe(store.save.mock.calls[0][0]);
  });

  it('refuses a mime type outside the allowlist', async () => {
    const { service } = setup();

    await expect(service.uploadImage(fileWith('text/html'))).rejects.toThrow(
      /Unsupported image mime type/,
    );
  });

  it('deletes a key through the store', async () => {
    const { service, store } = setup();

    await service.deleteImage('profiles/x.jpg');

    expect(store.remove).toHaveBeenCalledWith('profiles/x.jpg');
  });

  it('leaves external images alone on delete', async () => {
    const { service, store } = setup();

    await service.deleteImage('https://randomuser.me/x.jpg');

    expect(store.remove).not.toHaveBeenCalled();
  });

  it('never lets a failed delete bubble up', async () => {
    const { service, store } = setup();
    store.remove.mockRejectedValue(new Error('gone'));

    await expect(
      service.deleteImage('profiles/x.jpg'),
    ).resolves.toBeUndefined();
    expect(Logger.prototype.warn).toHaveBeenCalled();
  });
});
