import { Logger } from '@nestjs/common';
import type { SmsSender } from './sms-sender';

export class ConsoleSmsSender implements SmsSender {
  private readonly logger = new Logger(ConsoleSmsSender.name);

  send(to: string, body: string): Promise<void> {
    this.logger.warn(`[dev sms] to ${to}: ${body} (Twilio not configured)`);
    return Promise.resolve();
  }
}
