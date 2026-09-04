import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { EmailChannel } from './channels/email.channel';
import { WhatsappChannel } from './channels/whatsapp.channel';
import { NOTIFICATION_CHANNELS } from './notification-channel';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [WhatsappModule, MailModule],
  providers: [
    NotificationsService,
    EmailChannel,
    WhatsappChannel,
    {
      provide: NOTIFICATION_CHANNELS,
      inject: [EmailChannel, WhatsappChannel],
      useFactory: (email: EmailChannel, whatsapp: WhatsappChannel) => [
        email,
        whatsapp,
      ],
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
