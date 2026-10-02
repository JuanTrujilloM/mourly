import { Injectable } from '@nestjs/common';
import { StorageService } from './storage.service';
import type { ImageUrlLifetime } from './signed-url-window';
import {
  photoKeysPrimaryFirst,
  primaryPhotoKey,
  type StoredPhoto,
} from './photo-order';

@Injectable()
export class PhotoUrlService {
  constructor(private readonly storage: StorageService) {}

  async primaryUrl(
    photos: StoredPhoto[] | undefined,
    lifetime: ImageUrlLifetime,
  ): Promise<string | null> {
    const key = primaryPhotoKey(photos ?? []);
    return key ? this.storage.imageUrl(key, lifetime) : null;
  }

  orderedUrls(photos: StoredPhoto[] | undefined): Promise<string[]> {
    return Promise.all(
      photoKeysPrimaryFirst(photos ?? []).map((key) =>
        this.storage.imageUrl(key, 'page'),
      ),
    );
  }

  async withSignedPhotos<T extends { photos: StoredPhoto[] }>(owner: T) {
    const photos = await Promise.all(
      owner.photos.map(async ({ key, ...photo }) => ({
        ...photo,
        url: await this.storage.imageUrl(key, 'page'),
      })),
    );
    return { ...owner, photos };
  }
}
