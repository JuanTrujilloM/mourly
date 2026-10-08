import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isReviewEmail } from '../../common/constants/review-account';
import { PrismaService } from '../../config/prisma.service';
import { toE164Colombia } from '../sms/colombian-phone';
import { CELLPHONE_TAKEN_MESSAGE } from './phone-verification.messages';
import {
  PHONE_SMS_VERIFICATION_KEY,
  smsVerificationEnabled,
} from './phone-verification-mode';
import { UserLookupService } from './user-lookup.service';
import { MAX_ATTEMPTS } from './verification-code.service';

export interface AssignedCellphone {
  cellphone: string;
  cellphoneVerified: boolean;
}

interface CurrentNumber {
  cellphone: string | null;
  verified: boolean;
  needsSms: boolean;
}

@Injectable()
export class PhoneNumberService {
  private readonly smsVerification: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UserLookupService,
    config: ConfigService,
  ) {
    this.smsVerification = smsVerificationEnabled(
      config.get<string>(PHONE_SMS_VERIFICATION_KEY),
    );
  }

  async assign(userId: string, raw: string): Promise<AssignedCellphone> {
    const cellphone = toE164Colombia(raw);
    const current = await this.currentNumberOf(userId);
    if (this.hasNothingToChange(current, cellphone)) {
      return { cellphone, cellphoneVerified: current.verified };
    }
    if (await this.users.isCellphoneVerifiedByAnother(cellphone, userId)) {
      throw new BadRequestException(CELLPHONE_TAKEN_MESSAGE);
    }
    const cellphoneVerifiedAt = current.needsSms ? null : new Date();
    await this.prisma.$transaction([
      this.releaseFromUnverifiedHolders(userId, cellphone),
      this.prisma.user.update({
        where: { id: userId },
        data: { cellphone, cellphoneVerifiedAt },
      }),
      this.exhaustPendingCodes(userId),
    ]);
    return { cellphone, cellphoneVerified: cellphoneVerifiedAt !== null };
  }

  private hasNothingToChange(current: CurrentNumber, cellphone: string) {
    const sameNumber = current.cellphone === cellphone;
    return sameNumber && (current.verified || current.needsSms);
  }

  private async currentNumberOf(userId: string): Promise<CurrentNumber> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        isReviewAccount: true,
        cellphone: true,
        cellphoneVerifiedAt: true,
      },
    });
    const openReview = Boolean(
      user?.isReviewAccount && isReviewEmail(user.email),
    );
    return {
      cellphone: user?.cellphone ?? null,
      verified: Boolean(user?.cellphoneVerifiedAt),
      needsSms: this.smsVerification && !openReview,
    };
  }

  private releaseFromUnverifiedHolders(userId: string, cellphone: string) {
    return this.prisma.user.updateMany({
      where: { cellphone, cellphoneVerifiedAt: null, id: { not: userId } },
      data: { cellphone: null },
    });
  }

  private exhaustPendingCodes(userId: string) {
    return this.prisma.phoneVerificationCode.updateMany({
      where: { userId, consumedAt: null },
      data: { attempts: MAX_ATTEMPTS },
    });
  }
}
