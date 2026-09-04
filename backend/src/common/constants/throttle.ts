const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 100;
const DEFAULT_AUTH_LIMIT = 5;
const DEFAULT_PUBLIC_LINK_LIMIT = 20;

function positiveNumberFromEnv(key: string, fallback: number): number {
  const parsed = Number(process.env[key]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const THROTTLE_WINDOW_MS = positiveNumberFromEnv(
  'THROTTLE_WINDOW_MS',
  DEFAULT_WINDOW_MS,
);

export const THROTTLE_DEFAULT_LIMIT = positiveNumberFromEnv(
  'THROTTLE_DEFAULT_LIMIT',
  DEFAULT_LIMIT,
);

export const AUTH_THROTTLE = {
  default: {
    ttl: THROTTLE_WINDOW_MS,
    limit: positiveNumberFromEnv('THROTTLE_AUTH_LIMIT', DEFAULT_AUTH_LIMIT),
  },
};

export const PUBLIC_LINK_THROTTLE = {
  default: {
    ttl: THROTTLE_WINDOW_MS,
    limit: positiveNumberFromEnv(
      'THROTTLE_PUBLIC_LINK_LIMIT',
      DEFAULT_PUBLIC_LINK_LIMIT,
    ),
  },
};
