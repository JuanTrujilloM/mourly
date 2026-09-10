import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { verificationCodeEmail } from './templates/verification-code.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly devMode: boolean;

  constructor(private readonly config: ConfigService) {
    this.from = this.config.get<string>(
      'MAIL_FROM',
      'Mourly <no-reply@mourly.com>',
    );
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.devMode = !apiKey;
    // HTTPS API, not SMTP — hosts like Render block outbound SMTP ports (25/465/587)
    // on their free tier, which leaves nodemailer's SMTP transport hanging forever.
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    if (this.devMode) {
      this.logger.warn(
        `[dev mail] verification code for ${email}: ${code} (RESEND_API_KEY not configured)`,
      );
      return;
    }

    await this.send(email, verificationCodeEmail(code));
  }

  async send(
    to: string,
    content: { subject: string; html: string },
  ): Promise<void> {
    if (this.devMode) {
      this.logger.warn(
        `[dev mail] to ${to}: "${content.subject}" (RESEND_API_KEY not configured)`,
      );
      return;
    }

    const { error } = await this.resend!.emails.send({
      from: this.from,
      to,
      subject: content.subject,
      html: content.html,
    });

    if (error) {
      throw new Error(`Resend send failed: ${error.message}`);
    }
  }
}
