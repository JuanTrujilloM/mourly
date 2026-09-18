const MINUTE_MS = 60_000;
const RETENTION_DAYS = 30;

export function scheduledTick(now: Date): Date {
  return new Date(Math.floor(now.getTime() / MINUTE_MS) * MINUTE_MS);
}

export function retentionCutoff(now: Date): Date {
  return new Date(now.getTime() - RETENTION_DAYS * 24 * 60 * MINUTE_MS);
}
