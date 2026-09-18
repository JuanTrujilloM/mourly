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
  CELLPHONE_TAKEN_MESSAGE,
  SMS_SENT_MESSAGE,
  TOO_MANY_CODES_MESSAGE,
  messageForPhoneResult,
  phoneCodeSms,
} from './phone-verification.messages';
import { SafeUserService, type SafeUser } from './safe-user.service';
import { UserLookupService } from './user-lookup.service';
import { VerificationCodeIssuerService } from './verification-code-issuer.service';
import { VerificationCodeService } from './verification-code.service';
import { PHONE_CODE_ISSUER, PHONE_CODE_VALIDATOR } from './verification.tokens';

@Injectable()
export class PhoneVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UserLookupService,
    @Inject(PHONE_CODE_ISSUER)
    private readonly issuer: VerificationCodeIssuerService,
    @Inject(PHONE_CODE_VALIDATOR)
    private readonly codes: VerificationCodeService,
    @Inject(SMS_SENDER) private readonly sms: SmsSender,
    private readonly safeUsers: SafeUserService,
  ) {}

  async updateCellphone(
    userId: string,
    raw: string,
  ): Promise<{ cellphone: string }> {
    const cellphone = toE164Colombia(raw);
    if (await this.users.isCellphoneTaken(cellphone, userId)) {
      throw new BadRequestException(CELLPHONE_TAKEN_MESSAGE);
    }
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { cellphone, cellphoneVerifiedAt: null },
      }),
      this.prisma.phoneVerificationCode.deleteMany({
        where: { userId, consumedAt: null },
      }),
    ]);
    return { cellphone };
  }

  async sendCode(userId: string): Promise<Acknowledgement> {
    const cellphone = await this.pendingCellphoneOf(userId);
    const code = await this.issuer.issueIfAllowed(userId);
    if (!code) {
      throw new HttpException(
        TOO_MANY_CODES_MESSAGE,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    await this.sms.send(cellphone, phoneCodeSms(code, this.issuer.ttlMinutes));
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
