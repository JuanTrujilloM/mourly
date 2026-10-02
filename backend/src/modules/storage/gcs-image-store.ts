import { Storage, type Bucket } from '@google-cloud/storage';
import type { ImageStore } from './image-store';
import { SignedUrlCache } from './signed-url-cache';
import { signedUrlExpiry, type ImageUrlLifetime } from './signed-url-window';

export class GcsImageStore implements ImageStore {
  private readonly bucket: Bucket;
  private readonly signedUrls: Record<ImageUrlLifetime, SignedUrlCache> = {
    page: new SignedUrlCache(),
    email: new SignedUrlCache(),
  };

  constructor(bucketName: string) {
    this.bucket = new Storage().bucket(bucketName);
  }

  async save(key: string, file: Express.Multer.File): Promise<void> {
    await this.bucket.file(key).save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });
  }

  async remove(key: string): Promise<void> {
    await this.bucket.file(key).delete({ ignoreNotFound: true });
  }

  urlFor(key: string, lifetime: ImageUrlLifetime): Promise<string> {
    return this.signedUrls[lifetime].resolve(
      key,
      signedUrlExpiry(Date.now(), lifetime),
      (objectKey, expiresAt) => this.sign(objectKey, expiresAt),
    );
  }

  private async sign(key: string, expiresAt: number): Promise<string> {
    const [url] = await this.bucket.file(key).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: expiresAt,
    });
    return url;
  }
}
