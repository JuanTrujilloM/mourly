import { Inject, Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { VerificationCodeIssuerService } from './verification-code-issuer.service';
import { EMAIL_CODE_ISSUER } from './verification.tokens';

@Injectable()
export class VerificationDeliveryService {
  constructor(
    @Inject(EMAIL_CODE_ISSUER)
    private readonly issuer: VerificationCodeIssuerService,
    private readonly mail: MailService,
  ) {}

  async sendIfAllowed(userId: string, email: string): Promise<void> {
    const code = await this.issuer.issueIfAllowed(userId);
    if (code) {
      await this.mail.sendVerificationCode(email, code, this.issuer.ttlMinutes);
    }
  }
}
