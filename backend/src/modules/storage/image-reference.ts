const EXTERNAL_URL_PATTERN = /^https?:\/\//i;

export function isExternalImage(reference: string): boolean {
  return EXTERNAL_URL_PATTERN.test(reference);
}
