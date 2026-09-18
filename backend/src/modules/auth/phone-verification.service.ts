import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { toE164Colombia } from '../sms/colombian-phone';
import { SMS_SENDER, type SmsSender } from '../sms/sms-sender';
import type { Acknowledgement } from './auth.messages';
import {
  ALREADY_VERIFIED_MESSAGE,
  CELLPHONE_REQUIRED_MESSAGE,
  DAILY_LIMIT_MESSAGE,
  SMS_SENT_MESSAGE,
  TOO_MANY_CODES_MESSAGE,
  messageForPhoneResult,
  phoneCodeSms,
} from './phone-verification.messages';
import { PhoneCodeQuotaService } from './phone-code-quota.service';
import { SafeUserService, type SafeUser } from './safe-user.service';
import { VerificationCodeIssuerService } from './verification-code-issuer.service';
import { VerificationCodeService } from './verification-code.service';
import { PHONE_CODE_ISSUER, PHONE_CODE_VALIDATOR } from './verification.tokens';

@Injectable()
export class PhoneVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quota: PhoneCodeQuotaService,
    @Inject(PHONE_CODE_ISSUER)
    private readonly issuer: VerificationCodeIssuerService,
    @Inject(PHONE_CODE_VALIDATOR)
    private readonly codes: VerificationCodeService,
    @Inject(SMS_SENDER) private readonly sms: SmsSender,
    private readonly safeUsers: SafeUserService,
  ) {}

  async sendCode(userId: string): Promise<Acknowledgement> {
    const cellphone = await this.pendingCellphoneOf(userId);
    if (!(await this.quota.hasRemaining(userId))) {
      throw tooManyRequests(DAILY_LIMIT_MESSAGE);
    }
    const code = await this.issuer.issueIfAllowed(userId);
    if (!code) {
      throw tooManyRequests(TOO_MANY_CODES_MESSAGE);
    }
    await this.sms.send(
      toE164Colombia(cellphone),
      phoneCodeSms(code, this.issuer.ttlMinutes),
    );
    return { message: SMS_SENT_MESSAGE };
  }

  async verify(userId: string, code: string): Promise<SafeUser> {
    await this.pendingCellphoneOf(userId);
    const result = await this.codes.validate(userId, code);
    if (result !== 'ok') {
      throw new BadRequestException(messageForPhoneResult(result));
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { cellphoneVerifiedAt: new Date() },
    });
    return this.safeUsers.getById(userId);
  }

  private async pendingCellphoneOf(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { cellphone: true, cellphoneVerifiedAt: true },
    });
    if (!user?.cellphone) {
      throw new BadRequestException(CELLPHONE_REQUIRED_MESSAGE);
    }
    if (user.cellphoneVerifiedAt) {
      throw new BadRequestException(ALREADY_VERIFIED_MESSAGE);
    }
    return user.cellphone;
  }
}

function tooManyRequests(message: string): HttpException {
  return new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
}
