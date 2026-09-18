import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { toE164Colombia } from '../sms/colombian-phone';
import { CELLPHONE_TAKEN_MESSAGE } from './phone-verification.messages';
import { UserLookupService } from './user-lookup.service';
import { MAX_ATTEMPTS } from './verification-code.service';

@Injectable()
export class PhoneNumberService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UserLookupService,
  ) {}

  async assign(userId: string, raw: string): Promise<{ cellphone: string }> {
    const cellphone = toE164Colombia(raw);
    if (await this.isCurrentNumber(userId, cellphone)) {
      return { cellphone };
    }
    if (await this.users.isCellphoneVerifiedByAnother(cellphone, userId)) {
      throw new BadRequestException(CELLPHONE_TAKEN_MESSAGE);
    }
    await this.prisma.$transaction([
      this.releaseFromUnverifiedHolders(userId, cellphone),
      this.prisma.user.update({
        where: { id: userId },
        data: { cellphone, cellphoneVerifiedAt: null },
      }),
      this.exhaustPendingCodes(userId),
    ]);
    return { cellphone };
  }

  private async isCurrentNumber(
    userId: string,
    cellphone: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { cellphone: true },
    });
    return user?.cellphone === cellphone;
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
