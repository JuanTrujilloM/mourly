import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailModule } from '../mail/mail.module';
import { SmsModule } from '../sms/sms.module';
import { activeChannels, emailNotificationsEnabled } from './channel-selection';
import { EmailChannel } from './channels/email.channel';
import { SmsChannel } from './channels/sms.channel';
import {
  NOTIFICATION_CHANNELS,
  type NotificationChannel,
} from './notification-channel';
import { NotificationsService } from './notifications.service';

const EMAIL_DISABLED_NOTICE =
  'Email notifications are disabled (EMAIL_NOTIFICATIONS_ENABLED); only the verification code goes out by email.';

function createChannels(
  config: ConfigService,
  email: EmailChannel,
  sms: SmsChannel,
): NotificationChannel[] {
  const emailEnabled = emailNotificationsEnabled(
    config.get<string>('EMAIL_NOTIFICATIONS_ENABLED'),
  );
  if (!emailEnabled) {
    new Logger(NotificationsModule.name).warn(EMAIL_DISABLED_NOTICE);
  }
  return activeChannels(emailEnabled, email, [sms]);
}

@Module({
  imports: [SmsModule, MailModule],
  providers: [
    NotificationsService,
    EmailChannel,
    SmsChannel,
    {
      provide: NOTIFICATION_CHANNELS,
      inject: [ConfigService, EmailChannel, SmsChannel],
      useFactory: createChannels,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
