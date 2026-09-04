export const IMAGE_STORE = Symbol('IMAGE_STORE');

export interface ImageStore {
  save(key: string, file: Express.Multer.File): Promise<string>;
  remove(url: string): Promise<void>;
}
