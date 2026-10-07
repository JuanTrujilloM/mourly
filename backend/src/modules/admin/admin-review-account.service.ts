import { Injectable, Logger } from '@nestjs/common';
import { reviewAccountEmail } from '../../common/constants/review-account';
import { PrismaService } from '../../config/prisma.service';
import { PAUSED_PROFILE_STATUS } from '../profile/constants/profile-options';

const REVIEW_ACCOUNTS = { isReviewAccount: true };

export interface ReviewAccountClosure {
  revokedSessions: number;
  pausedProfiles: number;
  retiredCodes: number;
  reviewLoginStillOpen: boolean;
}

@Injectable()
export class AdminReviewAccountService {
  private readonly logger = new Logger(AdminReviewAccountService.name);

  constructor(private readonly prisma: PrismaService) {}

  async close(): Promise<ReviewAccountClosure> {
    const [sessions, profiles, codes] = await this.prisma.$transaction([
      this.prisma.refreshToken.updateMany({
        where: { user: REVIEW_ACCOUNTS, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      this.prisma.profile.updateMany({
        where: { user: REVIEW_ACCOUNTS },
        data: { status: PAUSED_PROFILE_STATUS },
      }),
      this.prisma.emailVerificationCode.deleteMany({
        where: { user: REVIEW_ACCOUNTS, consumedAt: null },
      }),
    ]);
    this.logger.log(`Review account closed: ${sessions.count} session(s).`);
    return {
      revokedSessions: sessions.count,
      pausedProfiles: profiles.count,
      retiredCodes: codes.count,
      reviewLoginStillOpen: reviewAccountEmail() !== null,
    };
  }
}
