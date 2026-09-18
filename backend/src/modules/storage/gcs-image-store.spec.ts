import { Storage } from '@google-cloud/storage';
import { GcsImageStore } from './gcs-image-store';

const save = jest.fn().mockResolvedValue(undefined);
const remove = jest.fn().mockResolvedValue([{}]);
const file = jest.fn(() => ({ save, delete: remove }));
const bucket = jest.fn(() => ({ file }));

jest.mock('@google-cloud/storage', () => ({
  Storage: jest.fn().mockImplementation(() => ({ bucket })),
}));

const FILE = {
  buffer: Buffer.from('bytes'),
  mimetype: 'image/png',
} as Express.Multer.File;

const PUBLIC_URL = 'https://storage.googleapis.com/mourly-media/profiles/a.png';

describe('GcsImageStore', () => {
  afterEach(() => {
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

  it('returns the public object url', async () => {
    const store = new GcsImageStore('mourly-media');

    expect(await store.save('profiles/a.png', FILE)).toBe(PUBLIC_URL);
  });

  it('deletes the object behind one of its own urls', async () => {
    const store = new GcsImageStore('mourly-media');

    await store.remove(PUBLIC_URL);

    expect(file).toHaveBeenCalledWith('profiles/a.png');
    expect(remove).toHaveBeenCalledWith({ ignoreNotFound: true });
  });

  it('ignores urls that belong to another bucket or host', async () => {
    const store = new GcsImageStore('mourly-media');

    await store.remove('https://storage.googleapis.com/other/profiles/a.png');
    await store.remove('http://localhost:3001/uploads/profiles/a.png');

    expect(remove).not.toHaveBeenCalled();
  });
});
