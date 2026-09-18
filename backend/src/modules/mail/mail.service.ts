import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { withTimeout } from '../../common/utils/with-timeout';
import type { EmailMessage } from './email-message';
import { CONTACT_EMAIL, DEFAULT_MAIL_FROM } from './mail.constants';
import { verificationCodeEmail } from './templates/verification-code.template';

const SEND_TIMEOUT_MS = 10_000;
const MISSING_API_KEY_MESSAGE = 'RESEND_API_KEY is required in production';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly replyTo: string;

  constructor(config: ConfigService) {
    this.from = config.get<string>('MAIL_FROM', DEFAULT_MAIL_FROM);
    this.replyTo = config.get<string>('MAIL_REPLY_TO', CONTACT_EMAIL);
    const apiKey = config.get<string>('RESEND_API_KEY');
    if (!apiKey && config.get<string>('NODE_ENV') === 'production') {
      throw new Error(MISSING_API_KEY_MESSAGE);
    }
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  sendVerificationCode(
    email: string,
    code: string,
    ttlMinutes: number,
  ): Promise<void> {
    return this.send(email, verificationCodeEmail({ code, ttlMinutes }));
  }

  async send(to: string, message: EmailMessage): Promise<void> {
    if (!this.resend) {
      this.logger.warn(
        `[dev mail] to ${to}: "${message.subject}" (RESEND_API_KEY not configured)`,
      );
      return;
    }

    const { error } = await withTimeout(
      this.resend.emails.send({
        from: this.from,
        to,
        replyTo: this.replyTo,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
      SEND_TIMEOUT_MS,
      'Resend send',
    );

    if (error) {
      throw new Error(`Resend send failed: ${error.message}`);
    }
  }
}
