export const MIN_PHOTOS = 1;

// Mirror of the backend image upload allowlist and size cap; keep in sync.
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png'];
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export const AVAILABILITY_STATUS = {
  SEARCHING: 'SEARCHING',
  PAUSED: 'PAUSED',
} as const;

export type AvailabilityStatus =
  (typeof AVAILABILITY_STATUS)[keyof typeof AVAILABILITY_STATUS];

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  SEARCHING: 'Buscando cita',
  PAUSED: 'En pausa',
};
