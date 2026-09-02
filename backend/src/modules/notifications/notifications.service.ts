import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Notification } from './notification';
import {
  NOTIFICATION_CHANNELS,
  type NotificationChannel,
} from './notification-channel';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(NOTIFICATION_CHANNELS)
    private readonly channels: NotificationChannel[],
  ) {}

  async send(notification: Notification): Promise<void> {
    const results = await Promise.allSettled(
      this.channels.map((channel) => channel.send(notification)),
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const reason: unknown = result.reason;
        this.logger.error(
          `${this.channels[index].name} send failed for ${notification.kind}`,
          reason instanceof Error ? reason.stack : String(reason),
        );
      }
    });
  }
}
