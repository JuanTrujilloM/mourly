export const MIN_PHOTOS = 1;

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
