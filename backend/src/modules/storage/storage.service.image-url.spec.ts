import { setupStorageService } from './storage.test-helpers';

describe('StorageService.imageUrl', () => {
  it('asks the store for the url of a key', async () => {
    const { service } = setupStorageService();

    expect(await service.imageUrl('profiles/x.jpg', 'page')).toBe(
      'https://signed/page/profiles/x.jpg',
    );
  });

  it('returns an external image url untouched', async () => {
    const { service, store } = setupStorageService();

    expect(await service.imageUrl('https://randomuser.me/x.jpg', 'email')).toBe(
      'https://randomuser.me/x.jpg',
    );
    expect(store.urlFor).not.toHaveBeenCalled();
  });
});
