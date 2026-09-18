import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../config/prisma.service';
import { JobClaimService } from '../scheduling/job-claim.service';
import { SCHEDULED_JOBS } from '../scheduling/scheduled-jobs';

const CLEANUP_CRON = '0 4 * * *';
const RETENTION_DAYS = 7;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class UnverifiedAccountCleanupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: JobClaimService,
  ) {}

  @Cron(CLEANUP_CRON)
  async purge(now = new Date()): Promise<number> {
    const claimed = await this.jobs.claim(
      SCHEDULED_JOBS.unverifiedAccountCleanup,
      now,
    );
    if (!claimed) return 0;

    const { count } = await this.prisma.user.deleteMany({
      where: {
        isVerified: false,
        createdAt: { lt: new Date(now.getTime() - RETENTION_DAYS * DAY_IN_MS) },
      },
    });
    return count;
  }
}
