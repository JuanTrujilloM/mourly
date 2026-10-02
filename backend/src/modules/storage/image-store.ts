import type { ImageUrlLifetime } from './signed-url-window';

export const IMAGE_STORE = Symbol('IMAGE_STORE');

export interface ImageStore {
  save(key: string, file: Express.Multer.File): Promise<void>;
  remove(key: string): Promise<void>;
  urlFor(key: string, lifetime: ImageUrlLifetime): Promise<string>;
}
