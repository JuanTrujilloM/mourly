import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { decideResend } from './verification-resend-policy';

const SALT_ROUNDS = 10;
const DEFAULT_TTL_MINUTES = 10;

@Injectable()
export class VerificationCodeIssuerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async issueIfAllowed(userId: string): Promise<string | null> {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const codeHash = await bcrypt.hash(code, SALT_ROUNDS);
    const issued = await this.prisma.$transaction((tx) =>
      this.replacePendingCode(tx, userId, codeHash),
    );
    return issued ? code : null;
  }

  private async replacePendingCode(
    tx: Prisma.TransactionClient,
    userId: string,
    codeHash: string,
  ): Promise<boolean> {
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
    const latest = await tx.emailVerificationCode.findFirst({
      where: { userId, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    const decision = decideResend(latest, Date.now());
    if (!decision.allowed) return false;

    await tx.emailVerificationCode.deleteMany({
      where: { userId, consumedAt: null },
    });
    await tx.emailVerificationCode.create({
      data: {
        userId,
        codeHash,
        resendCount: decision.resendCount,
        expiresAt: this.computeExpiry(),
      },
    });
    return true;
  }

  private computeExpiry(): Date {
    const ttlMinutes = Number(
      this.config.get<string>('EMAIL_CODE_TTL_MINUTES') ?? DEFAULT_TTL_MINUTES,
    );
    return new Date(Date.now() + ttlMinutes * 60 * 1000);
  }
}
