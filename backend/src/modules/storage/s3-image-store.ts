import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { ImageStore } from './image-store';

export class S3ImageStore implements ImageStore {
  private readonly client: S3Client;

  constructor(
    private readonly bucket: string,
    private readonly region: string,
  ) {
    this.client = new S3Client({ region });
  }

  async save(key: string, file: Express.Multer.File): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return `${this.baseUrl()}/${key}`;
  }

  async remove(url: string): Promise<void> {
    if (!url.startsWith(this.baseUrl())) {
      return;
    }
    const key = new URL(url).pathname.replace(/^\//, '');
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  private baseUrl(): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
  }
}
