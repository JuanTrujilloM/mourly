import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { EmailMessage } from './email-message';
import { CONTACT_EMAIL, DEFAULT_MAIL_FROM } from './mail.constants';
import { verificationCodeEmail } from './templates/verification-code.template';

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

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      replyTo: this.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    if (error) {
      throw new Error(`Resend send failed: ${error.message}`);
    }
  }
}
