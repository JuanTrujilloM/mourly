import { Twilio } from 'twilio';
import type { SmsOrigin } from './sms-origin';
import type { SmsSender } from './sms-sender';

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
    await this.client.messages.create({ ...this.origin, to, body });
  }
}
