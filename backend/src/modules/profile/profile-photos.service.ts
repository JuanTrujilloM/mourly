import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { MAX_PHOTOS } from './constants/profile-options';

const KEEP_PREFIX = 'keep:';

@Injectable()
export class ProfilePhotosService {
  constructor(private readonly storage: StorageService) {}

  async resolveKeys(
    manifestJson: string | undefined,
    files: Express.Multer.File[],
    ownedKeys: Map<string, string>,
  ): Promise<string[]> {
    const manifest = this.parseManifest(manifestJson);
    const keys =
      manifest.length === 0
        ? await this.uploadAll(files)
        : await this.applyManifest(manifest, files, ownedKeys);

    this.assertCount(keys);
    return keys;
  }

  async removeUnused(ownedKeys: string[], kept: string[]): Promise<void> {
    const keptSet = new Set(kept);
    const removed = ownedKeys.filter((key) => !keptSet.has(key));
    await Promise.all(removed.map((key) => this.storage.deleteImage(key)));
  }

  private uploadAll(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(
      (files ?? []).map((file) => this.storage.uploadImage(file)),
    );
  }

  private async applyManifest(
    manifest: string[],
    files: Express.Multer.File[],
    ownedKeys: Map<string, string>,
  ): Promise<string[]> {
    const keys: string[] = [];
    let fileIndex = 0;

    for (const entry of manifest) {
      if (entry === 'new') {
        const file = files?.[fileIndex++];
        if (!file) {
          throw new BadRequestException('A photo file is missing.');
        }
        keys.push(await this.storage.uploadImage(file));
        continue;
      }
      if (entry.startsWith(KEEP_PREFIX)) {
        const key = ownedKeys.get(entry.slice(KEEP_PREFIX.length));
        if (!key) {
          throw new BadRequestException('Invalid photo reference.');
        }
        keys.push(key);
      }
    }
    return keys;
  }

  private assertCount(keys: string[]): void {
    if (keys.length < 1) {
      throw new BadRequestException('At least one photo is required.');
    }
    if (keys.length > MAX_PHOTOS) {
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
