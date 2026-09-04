import { randomUUID } from 'crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { IMAGE_STORE, type ImageStore } from './image-store';
import { imageExtensionFor } from './image-upload.constants';

const PROFILE_KEY_PREFIX = 'profiles';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(@Inject(IMAGE_STORE) private readonly store: ImageStore) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const extension = imageExtensionFor(file.mimetype);
    const key = `${PROFILE_KEY_PREFIX}/${randomUUID()}${extension}`;
    return this.store.save(key, file);
  }

  async deleteImage(url: string): Promise<void> {
    try {
      await this.store.remove(url);
    } catch (error) {
      this.logger.warn(`Could not delete image ${url}: ${String(error)}`);
    }
  }
}
