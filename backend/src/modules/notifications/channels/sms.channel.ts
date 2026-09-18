import { Inject, Injectable } from '@nestjs/common';
import { toE164Colombia } from '../../sms/colombian-phone';
import { SMS_SENDER, type SmsSender } from '../../sms/sms-sender';
import type { Notification } from '../notification';
import type { NotificationChannel } from '../notification-channel';
import { smsMessageFor } from '../sms-messages';

const MISSING_CELLPHONE = 'Recipient has no cellphone';

@Injectable()
export class SmsChannel implements NotificationChannel {
  readonly name = 'sms';

  constructor(@Inject(SMS_SENDER) private readonly sender: SmsSender) {}

  send(notification: Notification): Promise<void> {
    const { cellphone } = notification.recipient;
    if (!cellphone) {
      return Promise.reject(new Error(MISSING_CELLPHONE));
    }
    return this.sender.send(
      toE164Colombia(cellphone),
      smsMessageFor(notification),
    );
  }
}
