import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { S3ImageStore } from './s3-image-store';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
  PutObjectCommand: jest.fn().mockImplementation((input: unknown) => ({
    input,
  })),
  DeleteObjectCommand: jest.fn().mockImplementation((input: unknown) => ({
    input,
  })),
}));

const FILE = {
  buffer: Buffer.from('bytes'),
  mimetype: 'image/png',
} as Express.Multer.File;

function buildStore() {
  const store = new S3ImageStore('media-bucket', 'us-east-1');
  const send = (S3Client as unknown as jest.Mock).mock.results[0].value
    .send as jest.Mock;
  send.mockResolvedValue({});
  return { store, send };
}

describe('S3ImageStore', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uploads with the file content type', async () => {
    const { store } = buildStore();

    await store.save('profiles/a.png', FILE);

    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: 'media-bucket',
      Key: 'profiles/a.png',
      Body: FILE.buffer,
      ContentType: 'image/png',
    });
  });

  it('returns the public bucket url', async () => {
    const { store } = buildStore();

    expect(await store.save('profiles/a.png', FILE)).toBe(
      'https://media-bucket.s3.us-east-1.amazonaws.com/profiles/a.png',
    );
  });

  it('deletes an object that belongs to the bucket', async () => {
    const { store } = buildStore();

    await store.remove(
      'https://media-bucket.s3.us-east-1.amazonaws.com/profiles/a.png',
    );

    expect(DeleteObjectCommand).toHaveBeenCalledWith({
      Bucket: 'media-bucket',
      Key: 'profiles/a.png',
    });
  });

  it('ignores a url from another host', async () => {
    const { store } = buildStore();

    await store.remove('http://localhost:3001/uploads/profiles/a.png');

    expect(DeleteObjectCommand).not.toHaveBeenCalled();
  });
});
