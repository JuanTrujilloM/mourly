import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

const RESEND_COOLDOWN_SECONDS = 60;
const MAX_RESENDS = 3;

@Injectable()
export class VerificationResendPolicyService {
  constructor(private readonly prisma: PrismaService) {}

  async getSecondsUntilResendAllowed(userId: string): Promise<number> {
    const pending = await this.findPendingCode(userId);
    if (!pending) return 0;

    const elapsed = (Date.now() - pending.createdAt.getTime()) / 1000;
    return Math.max(0, Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed));
  }

  async hasExhaustedResends(userId: string): Promise<boolean> {
    const pending = await this.findPendingCode(userId);
    return pending !== null && pending.resendCount >= MAX_RESENDS;
  }

  async nextResendCount(userId: string): Promise<number> {
    const pending = await this.findPendingCode(userId);
    return pending ? pending.resendCount + 1 : 0;
  }

  private async findPendingCode(userId: string) {
    const latest = await this.prisma.emailVerificationCode.findFirst({
      where: { userId, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return latest && latest.expiresAt.getTime() > Date.now() ? latest : null;
  }
}
