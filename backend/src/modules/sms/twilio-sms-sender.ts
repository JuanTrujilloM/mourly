import { Twilio } from 'twilio';
import { withTimeout } from '../../common/utils/with-timeout';
import type { SmsOrigin } from './sms-origin';
import type { SmsSender } from './sms-sender';

const SEND_TIMEOUT_MS = 10_000;

export class TwilioSmsSender implements SmsSender {
  private readonly client: Twilio;

  constructor(
    accountSid: string,
    authToken: string,
    private readonly origin: SmsOrigin,
  ) {
    this.client = new Twilio(accountSid, authToken);
  }

  async send(to: string, body: string): Promise<void> {
    await withTimeout(
      this.client.messages.create({ ...this.origin, to, body }),
      SEND_TIMEOUT_MS,
      'Twilio send',
    );
  }
}
