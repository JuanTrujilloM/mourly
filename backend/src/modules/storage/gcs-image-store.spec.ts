import { Storage } from '@google-cloud/storage';
import { GcsImageStore } from './gcs-image-store';

const save = jest.fn().mockResolvedValue(undefined);
const remove = jest.fn().mockResolvedValue([{}]);
const getSignedUrl = jest.fn();
const file = jest.fn(() => ({ save, delete: remove, getSignedUrl }));
const bucket = jest.fn(() => ({ file }));

jest.mock('@google-cloud/storage', () => ({
  Storage: jest.fn().mockImplementation(() => ({ bucket })),
}));

const FILE = {
  buffer: Buffer.from('bytes'),
  mimetype: 'image/png',
} as Express.Multer.File;

const HOUR_MS = 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 1, 15, 20);

describe('GcsImageStore', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    getSignedUrl.mockImplementation(() =>
      Promise.resolve([`https://signed/${getSignedUrl.mock.calls.length}`]),
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('uses application default credentials for the configured bucket', () => {
    new GcsImageStore('mourly-media');

    expect(Storage).toHaveBeenCalledWith();
    expect(bucket).toHaveBeenCalledWith('mourly-media');
  });

  it('uploads the buffer with its content type in a single request', async () => {
    const store = new GcsImageStore('mourly-media');

    await store.save('profiles/a.png', FILE);

    expect(file).toHaveBeenCalledWith('profiles/a.png');
    expect(save).toHaveBeenCalledWith(FILE.buffer, {
      contentType: 'image/png',
      resumable: false,
    });
  });

  it('deletes the object behind a key', async () => {
    const store = new GcsImageStore('mourly-media');

    await store.remove('profiles/a.png');

    expect(file).toHaveBeenCalledWith('profiles/a.png');
    expect(remove).toHaveBeenCalledWith({ ignoreNotFound: true });
  });

  it('signs a v4 read url that expires at the end of the next hour window', async () => {
    const store = new GcsImageStore('mourly-media');

    expect(await store.urlFor('profiles/a.png', 'page')).toBe(
      'https://signed/1',
    );
    expect(file).toHaveBeenCalledWith('profiles/a.png');
    expect(getSignedUrl).toHaveBeenCalledWith({
      version: 'v4',
      action: 'read',
      expires: Date.UTC(2026, 9, 1, 17),
    });
  });

  it('reuses the signed url within the same window', async () => {
    const store = new GcsImageStore('mourly-media');

    const first = await store.urlFor('profiles/a.png', 'page');
    jest.setSystemTime(NOW + HOUR_MS / 2);
    const second = await store.urlFor('profiles/a.png', 'page');

    expect(second).toBe(first);
    expect(getSignedUrl).toHaveBeenCalledTimes(1);
  });

  it('signs again once the window rolls over', async () => {
    const store = new GcsImageStore('mourly-media');

    await store.urlFor('profiles/a.png', 'page');
    jest.setSystemTime(NOW + HOUR_MS);
    const renewed = await store.urlFor('profiles/a.png', 'page');

    expect(renewed).toBe('https://signed/2');
    expect(getSignedUrl).toHaveBeenLastCalledWith(
      expect.objectContaining({ expires: Date.UTC(2026, 9, 1, 18) }),
    );
  });

  it('signs email urls for up to seven days, apart from page urls', async () => {
    const store = new GcsImageStore('mourly-media');

    const page = await store.urlFor('profiles/a.png', 'page');
    const email = await store.urlFor('profiles/a.png', 'email');

    expect(email).not.toBe(page);
    expect(getSignedUrl).toHaveBeenLastCalledWith(
      expect.objectContaining({ expires: Date.UTC(2026, 9, 8) }),
    );
  });
});
