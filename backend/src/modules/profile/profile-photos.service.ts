import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { MAX_PHOTOS } from './constants/profile-options';

const KEEP_PREFIX = 'keep:';

@Injectable()
export class ProfilePhotosService {
  constructor(private readonly storage: StorageService) {}

  async resolveUrls(
    manifestJson: string | undefined,
    files: Express.Multer.File[],
    ownedUrls: Set<string>,
  ): Promise<string[]> {
    const manifest = this.parseManifest(manifestJson);
    const urls =
      manifest.length === 0
        ? await this.uploadAll(files)
        : await this.applyManifest(manifest, files, ownedUrls);

    this.assertCount(urls);
    return urls;
  }

  async removeUnused(ownedUrls: Set<string>, kept: string[]): Promise<void> {
    const keptSet = new Set(kept);
    const removed = [...ownedUrls].filter((url) => !keptSet.has(url));
    await Promise.all(removed.map((url) => this.storage.deleteImage(url)));
  }

  private uploadAll(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(
      (files ?? []).map((file) => this.storage.uploadImage(file)),
    );
  }

  private async applyManifest(
    manifest: string[],
    files: Express.Multer.File[],
    ownedUrls: Set<string>,
  ): Promise<string[]> {
    const urls: string[] = [];
    let fileIndex = 0;

    for (const entry of manifest) {
      if (entry === 'new') {
        const file = files?.[fileIndex++];
        if (!file) {
          throw new BadRequestException('A photo file is missing.');
        }
        urls.push(await this.storage.uploadImage(file));
        continue;
      }
      if (entry.startsWith(KEEP_PREFIX)) {
        const url = entry.slice(KEEP_PREFIX.length);
        if (!ownedUrls.has(url)) {
          throw new BadRequestException('Invalid photo reference.');
        }
        urls.push(url);
      }
    }
    return urls;
  }

  private assertCount(urls: string[]): void {
    if (urls.length < 1) {
      throw new BadRequestException('At least one photo is required.');
    }
    if (urls.length > MAX_PHOTOS) {
      throw new BadRequestException(
        `At most ${MAX_PHOTOS} photos are allowed.`,
      );
    }
  }

  private parseManifest(raw?: string): string[] {
    if (!raw) {
      return [];
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string')
        : [];
    } catch {
      return [];
    }
  }
}
