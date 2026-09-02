import { mkdir, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { LocalImageStore } from './local-image-store';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

const mkdirMock = mkdir as jest.MockedFunction<typeof mkdir>;
const writeFileMock = writeFile as jest.MockedFunction<typeof writeFile>;
const unlinkMock = unlink as jest.MockedFunction<typeof unlink>;

function buildStore(env: Record<string, string> = {}) {
  const config = { get: (key: string) => env[key] } as unknown as ConfigService;
  return new LocalImageStore(config);
}

const FILE = { buffer: Buffer.from('bytes') } as Express.Multer.File;

describe('LocalImageStore', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates the directory before writing the file', async () => {
    const store = buildStore();

    await store.save('profiles/a.jpg', FILE);

    expect(mkdirMock).toHaveBeenCalledWith(
      join(process.cwd(), 'uploads', 'profiles'),
      { recursive: true },
    );
    expect(writeFileMock).toHaveBeenCalledWith(
      join(process.cwd(), 'uploads', 'profiles', 'a.jpg'),
      FILE.buffer,
    );
  });

  it('builds a url on the default backend host', async () => {
    const store = buildStore();

    expect(await store.save('profiles/a.jpg', FILE)).toBe(
      'http://localhost:3001/uploads/profiles/a.jpg',
    );
  });

  it('honors a configured public url without a trailing slash', async () => {
    const store = buildStore({ BACKEND_PUBLIC_URL: 'https://api.test/' });

    expect(await store.save('profiles/a.jpg', FILE)).toBe(
      'https://api.test/uploads/profiles/a.jpg',
    );
  });

  it('removes the file behind a local url', async () => {
    const store = buildStore();

    await store.remove('http://localhost:3001/uploads/profiles/a.jpg');

    expect(unlinkMock).toHaveBeenCalledWith(
      join(process.cwd(), 'uploads', 'profiles', 'a.jpg'),
    );
  });

  it('ignores a url that does not belong to local storage', async () => {
    const store = buildStore();

    await store.remove('https://bucket.s3.us-east-1.amazonaws.com/a.jpg');

    expect(unlinkMock).not.toHaveBeenCalled();
  });
});
