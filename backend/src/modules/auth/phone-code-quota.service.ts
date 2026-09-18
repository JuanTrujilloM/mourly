import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export const DAILY_PHONE_CODE_LIMIT = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class PhoneCodeQuotaService {
  constructor(private readonly prisma: PrismaService) {}

  async hasRemaining(userId: string, now = new Date()): Promise<boolean> {
    const issued = await this.prisma.phoneVerificationCode.count({
      where: { userId, createdAt: { gte: new Date(now.getTime() - DAY_MS) } },
    });
    return issued < DAILY_PHONE_CODE_LIMIT;
  }
}
