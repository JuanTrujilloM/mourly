import type { NotificationChannel } from './notification-channel';

export function emailNotificationsEnabled(value: string | undefined): boolean {
  return value === 'true';
}

export function activeChannels(
  emailEnabled: boolean,
  email: NotificationChannel,
  others: NotificationChannel[],
): NotificationChannel[] {
  return emailEnabled ? [email, ...others] : others;
}
