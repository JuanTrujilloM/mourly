import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma.service';

export type VerificationResult =
  | 'ok'
  | 'not_found'
  | 'expired'
  | 'too_many_attempts'
  | 'mismatch';

const MAX_ATTEMPTS = 5;

@Injectable()
export class VerificationCodeService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(userId: string, code: string): Promise<VerificationResult> {
    const record = await this.prisma.emailVerificationCode.findFirst({
      where: { userId, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) return 'not_found';
    if (record.expiresAt.getTime() < Date.now()) return 'expired';
    if (record.attempts >= MAX_ATTEMPTS) return 'too_many_attempts';

    const matches = await bcrypt.compare(code, record.codeHash);
    if (!matches) {
      await this.prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      return 'mismatch';
    }

    await this.prisma.emailVerificationCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });
    return 'ok';
  }

  async hasVerifiedEmail(userId: string): Promise<boolean> {
    const consumed = await this.prisma.emailVerificationCode.findFirst({
      where: { userId, consumedAt: { not: null } },
      select: { id: true },
    });
    return consumed !== null;
  }
}
