import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma.service';

export type VerificationResult =
  | 'ok'
  | 'not_found'
  | 'expired'
  | 'too_many_attempts'
  | 'mismatch';

const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const SALT_ROUNDS = 10;

@Injectable()
export class VerificationCodeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async issueForUser(userId: string): Promise<string> {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const codeHash = await bcrypt.hash(code, SALT_ROUNDS);

    await this.prisma.emailVerificationCode.deleteMany({
      where: { userId, consumedAt: null },
    });
    await this.prisma.emailVerificationCode.create({
      data: { userId, codeHash, expiresAt: this.computeExpiry() },
    });

    return code;
  }

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

  async getSecondsUntilResendAllowed(userId: string): Promise<number> {
    const latest = await this.prisma.emailVerificationCode.findFirst({
      where: { userId, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!latest) return 0;

    const elapsed = (Date.now() - latest.createdAt.getTime()) / 1000;
    return Math.max(0, Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed));
  }

  private computeExpiry(): Date {
    const ttlMinutes = Number(
      this.config.get<string>('EMAIL_CODE_TTL_MINUTES') ?? 10,
    );
    return new Date(Date.now() + ttlMinutes * 60 * 1000);
  }
}
