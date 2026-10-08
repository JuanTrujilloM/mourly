import { randomInt } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma.service';
import type {
  PendingVerificationCodeRecord,
  VerificationCodeDb,
  VerificationCodeTable,
} from './verification-code-table';
import { decideResend } from './verification-resend-policy';

const SALT_ROUNDS = 10;

function attemptsStillRunning(
  latest: PendingVerificationCodeRecord | null,
  now: number,
): number {
  return latest && latest.expiresAt.getTime() > now ? latest.attempts : 0;
}

export class VerificationCodeIssuerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly table: VerificationCodeTable,
    readonly ttlMinutes: number,
  ) {}

  async issueIfAllowed(
    userId: string,
    fixedCode?: string,
  ): Promise<string | null> {
    const code =
      fixedCode ?? randomInt(0, 1_000_000).toString().padStart(6, '0');
    const codeHash = await bcrypt.hash(code, SALT_ROUNDS);
    const issued = await this.prisma.$transaction((tx) =>
      this.replacePendingCode(tx, userId, codeHash, fixedCode !== undefined),
    );
    return issued ? code : null;
  }

  private async replacePendingCode(
    tx: VerificationCodeDb,
    userId: string,
    codeHash: string,
    sameSecret: boolean,
  ): Promise<boolean> {
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
    const latest = await this.table.findLatestPending(tx, userId);
    const now = Date.now();

    const decision = decideResend(latest, now);
    if (!decision.allowed) return false;

    await this.table.retirePending(tx, userId);
    await this.table.create(tx, {
      userId,
      codeHash,
      resendCount: decision.resendCount,
      attempts: sameSecret ? attemptsStillRunning(latest, now) : 0,
      expiresAt: this.computeExpiry(),
    });
    return true;
  }

  private computeExpiry(): Date {
    return new Date(Date.now() + this.ttlMinutes * 60 * 1000);
  }
}
