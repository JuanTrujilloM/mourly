import { Injectable } from '@nestjs/common';
import { WhatsappSenderService } from '../../whatsapp/whatsapp-sender.service';
import { whatsappMessageFor } from '../whatsapp-messages';
import type { Notification } from '../notification';
import type { NotificationChannel } from '../notification-channel';

@Injectable()
export class WhatsappChannel implements NotificationChannel {
  readonly name = 'whatsapp';

  constructor(private readonly sender: WhatsappSenderService) {}

  send(notification: Notification): Promise<void> {
    return this.sender.send(
      notification.recipient.cellphone,
      whatsappMessageFor(notification),
    );
  }
}
