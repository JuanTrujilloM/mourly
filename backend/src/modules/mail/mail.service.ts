import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { verificationCodeEmail } from './templates/verification-code.template';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter!: nodemailer.Transporter;
  private readonly from: string;
  private readonly devMode: boolean;

  constructor(private readonly config: ConfigService) {
    this.from = this.config.get<string>(
      'MAIL_FROM',
      'TheConnection <no-reply@theconnection.co>',
    );
    this.devMode = !this.config.get<string>('SMTP_HOST');
  }

  onModuleInit() {
    this.transporter = this.devMode
      ? nodemailer.createTransport({ jsonTransport: true })
      : nodemailer.createTransport({
          host: this.config.get<string>('SMTP_HOST'),
          port: Number(this.config.get<string>('SMTP_PORT') ?? 587),
          secure: this.config.get<string>('SMTP_SECURE') === 'true',
          auth: {
            user: this.config.get<string>('SMTP_USER'),
            pass: this.config.get<string>('SMTP_PASS'),
          },
        });
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    if (this.devMode) {
      this.logger.warn(
        `[dev mail] verification code for ${email}: ${code} (SMTP not configured)`,
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
        `[dev mail] to ${to}: "${content.subject}" (SMTP not configured)`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: content.subject,
      html: content.html,
    });
  }
}
