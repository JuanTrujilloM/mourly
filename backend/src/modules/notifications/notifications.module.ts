import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailModule } from '../mail/mail.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { activeChannels, emailNotificationsEnabled } from './channel-selection';
import { EmailChannel } from './channels/email.channel';
import { WhatsappChannel } from './channels/whatsapp.channel';
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
  whatsapp: WhatsappChannel,
): NotificationChannel[] {
  const emailEnabled = emailNotificationsEnabled(
    config.get<string>('EMAIL_NOTIFICATIONS_ENABLED'),
  );
  if (!emailEnabled) {
    new Logger(NotificationsModule.name).warn(EMAIL_DISABLED_NOTICE);
  }
  return activeChannels(emailEnabled, email, [whatsapp]);
}

@Module({
  imports: [WhatsappModule, MailModule],
  providers: [
    NotificationsService,
    EmailChannel,
    WhatsappChannel,
    {
      provide: NOTIFICATION_CHANNELS,
      inject: [ConfigService, EmailChannel, WhatsappChannel],
      useFactory: createChannels,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
