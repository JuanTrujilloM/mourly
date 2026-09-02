export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const IMAGE_EXTENSION_BY_MIME_TYPE = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

export const ALLOWED_IMAGE_MIME_TYPES = [
  ...IMAGE_EXTENSION_BY_MIME_TYPE.keys(),
];

export function isAllowedImageMimeType(mimeType: string): boolean {
  return IMAGE_EXTENSION_BY_MIME_TYPE.has(mimeType);
}

export function imageExtensionFor(mimeType: string): string {
  const extension = IMAGE_EXTENSION_BY_MIME_TYPE.get(mimeType);
  if (!extension) {
    throw new Error(`Unsupported image mime type: ${mimeType}`);
  }
  return extension;
}
