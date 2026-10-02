import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { ConfigService } from '@nestjs/config';
import type { ImageStore } from './image-store';

const LOCAL_PREFIX = '/uploads/';
const UPLOADS_DIRECTORY = 'uploads';
const DEFAULT_BACKEND_URL = 'http://localhost:3001';

export class LocalImageStore implements ImageStore {
  constructor(private readonly config: ConfigService) {}

  async save(key: string, file: Express.Multer.File): Promise<void> {
    const absolutePath = this.pathFor(key);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.buffer);
  }

  async remove(key: string): Promise<void> {
    await unlink(this.pathFor(key));
  }

  urlFor(key: string): Promise<string> {
    return Promise.resolve(`${this.baseUrl()}${LOCAL_PREFIX}${key}`);
  }

  private pathFor(key: string): string {
    return join(process.cwd(), UPLOADS_DIRECTORY, key);
  }

  private baseUrl(): string {
    return (
      this.config.get<string>('BACKEND_PUBLIC_URL') ?? DEFAULT_BACKEND_URL
    ).replace(/\/+$/, '');
  }
}
