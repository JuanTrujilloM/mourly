export const FEEDBACK_REQUEST_DELAY_HOURS = 24;
export const FEEDBACK_REMINDER_DELAY_HOURS = 48;
export const FEEDBACK_CLOSE_DELAY_HOURS = 24;
export const FEEDBACK_WINDOW_CRON = '0 * * * *';

export const HOUR_IN_MS = 60 * 60 * 1000;

export function hoursBefore(now: Date, hours: number): Date {
  return new Date(now.getTime() - hours * HOUR_IN_MS);
}
