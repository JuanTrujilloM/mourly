import type { Notification } from './notification';

export const NOTIFICATION_CHANNELS = Symbol('NOTIFICATION_CHANNELS');

export interface NotificationChannel {
  readonly name: string;
  send(notification: Notification): Promise<void>;
}
