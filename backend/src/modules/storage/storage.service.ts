import { randomUUID } from 'crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { IMAGE_STORE, type ImageStore } from './image-store';
import { imageExtensionFor } from './image-upload.constants';
import { isExternalImage } from './image-reference';
import type { ImageUrlLifetime } from './signed-url-window';

const PROFILE_KEY_PREFIX = 'profiles';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(@Inject(IMAGE_STORE) private readonly store: ImageStore) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const extension = imageExtensionFor(file.mimetype);
    const key = `${PROFILE_KEY_PREFIX}/${randomUUID()}${extension}`;
    await this.store.save(key, file);
    return key;
  }

  async deleteImage(reference: string): Promise<void> {
    if (isExternalImage(reference)) {
      return;
    }
    try {
      await this.store.remove(reference);
    } catch (error) {
      this.logger.warn(`Could not delete image ${reference}: ${String(error)}`);
    }
  }

  imageUrl(reference: string, lifetime: ImageUrlLifetime): Promise<string> {
    return isExternalImage(reference)
      ? Promise.resolve(reference)
      : this.store.urlFor(reference, lifetime);
  }
}
