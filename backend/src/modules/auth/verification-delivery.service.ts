import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { VerificationCodeIssuerService } from './verification-code-issuer.service';

@Injectable()
export class VerificationDeliveryService {
  constructor(
    private readonly issuer: VerificationCodeIssuerService,
    private readonly mail: MailService,
  ) {}

  async sendIfAllowed(userId: string, email: string): Promise<void> {
    const code = await this.issuer.issueIfAllowed(userId);
    if (code) {
      await this.mail.sendVerificationCode(email, code);
    }
  }
}
