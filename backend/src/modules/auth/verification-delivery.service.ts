import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { VerificationCodeService } from './verification-code.service';

@Injectable()
export class VerificationDeliveryService {
  constructor(
    private readonly codes: VerificationCodeService,
    private readonly mail: MailService,
  ) {}

  async send(userId: string, email: string): Promise<void> {
    const code = await this.codes.issueForUser(userId);
    await this.mail.sendVerificationCode(email, code);
  }

  async sendIfCooldownElapsed(userId: string, email: string): Promise<void> {
    const secondsLeft = await this.codes.getSecondsUntilResendAllowed(userId);
    if (secondsLeft <= 0) {
      await this.send(userId, email);
    }
  }

  async sendOrThrowCooldown(userId: string, email: string): Promise<void> {
    const secondsLeft = await this.codes.getSecondsUntilResendAllowed(userId);
    if (secondsLeft > 0) {
      throw new HttpException(
        `Please wait ${secondsLeft}s before requesting another code.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    await this.send(userId, email);
  }
}
