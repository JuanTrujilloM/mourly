import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { VerificationCodeService } from './verification-code.service';
import { VerificationResendPolicyService } from './verification-resend-policy.service';
import { RESEND_LIMIT_MESSAGE, cooldownMessage } from './verification-messages';

@Injectable()
export class VerificationDeliveryService {
  constructor(
    private readonly codes: VerificationCodeService,
    private readonly mail: MailService,
    private readonly resendPolicy: VerificationResendPolicyService,
  ) {}

  async send(userId: string, email: string): Promise<void> {
    const code = await this.codes.issueForUser(userId);
    await this.mail.sendVerificationCode(email, code);
  }

  async sendIfAllowed(userId: string, email: string): Promise<void> {
    if (await this.resendPolicy.hasExhaustedResends(userId)) return;
    const secondsLeft =
      await this.resendPolicy.getSecondsUntilResendAllowed(userId);
    if (secondsLeft <= 0) {
      await this.send(userId, email);
    }
  }

  async sendOrThrow(userId: string, email: string): Promise<void> {
    if (await this.resendPolicy.hasExhaustedResends(userId)) {
      throw new ForbiddenException(RESEND_LIMIT_MESSAGE);
    }

    const secondsLeft =
      await this.resendPolicy.getSecondsUntilResendAllowed(userId);
    if (secondsLeft > 0) {
      throw new HttpException(
        {
          message: cooldownMessage(secondsLeft),
          retryAfterSeconds: secondsLeft,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    await this.send(userId, email);
  }
}
