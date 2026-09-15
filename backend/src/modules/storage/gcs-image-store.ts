import { Storage, type Bucket } from '@google-cloud/storage';
import type { ImageStore } from './image-store';

const PUBLIC_HOST = 'https://storage.googleapis.com';

export class GcsImageStore implements ImageStore {
  private readonly bucket: Bucket;

  constructor(private readonly bucketName: string) {
    this.bucket = new Storage().bucket(bucketName);
  }

  async save(key: string, file: Express.Multer.File): Promise<string> {
    await this.bucket.file(key).save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });
    return `${this.baseUrl()}/${key}`;
  }

  async remove(url: string): Promise<void> {
    const prefix = `${this.baseUrl()}/`;
    if (!url.startsWith(prefix)) {
      return;
    }
    await this.bucket
      .file(url.slice(prefix.length))
      .delete({ ignoreNotFound: true });
  }

  private baseUrl(): string {
    return `${PUBLIC_HOST}/${this.bucketName}`;
  }
}
