const DEFAULT_TTL_MINUTES = 10;

export function parseTtlMinutes(value: string | undefined): number {
  const minutes = Number(value);
  return Number.isFinite(minutes) && minutes > 0
    ? minutes
    : DEFAULT_TTL_MINUTES;
}
