import { Injectable } from '@nestjs/common';
import { MailService } from '../../mail/mail.service';
import { emailContentFor } from '../email-content';
import type { Notification } from '../notification';
import type { NotificationChannel } from '../notification-channel';

@Injectable()
export class EmailChannel implements NotificationChannel {
  readonly name = 'email';

  constructor(private readonly mail: MailService) {}

  send(notification: Notification): Promise<void> {
    return this.mail.send(
      notification.recipient.email,
      emailContentFor(notification),
    );
  }
}
