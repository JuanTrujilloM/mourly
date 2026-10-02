const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export type ImageUrlLifetime = 'page' | 'email';

const WINDOWS: Record<ImageUrlLifetime, { sizeMs: number; ahead: number }> = {
  page: { sizeMs: HOUR_MS, ahead: 2 },
  email: { sizeMs: DAY_MS, ahead: 7 },
};

export function signedUrlExpiry(
  nowMs: number,
  lifetime: ImageUrlLifetime,
): number {
  const { sizeMs, ahead } = WINDOWS[lifetime];
  return (Math.floor(nowMs / sizeMs) + ahead) * sizeMs;
}
