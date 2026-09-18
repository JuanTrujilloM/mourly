import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ScheduledJobName } from './scheduled-jobs';
import { retentionCutoff, scheduledTick } from './scheduled-tick';

@Injectable()
export class JobClaimService {
  constructor(private readonly prisma: PrismaService) {}

  async claim(jobName: ScheduledJobName, now = new Date()): Promise<boolean> {
    const { count } = await this.prisma.scheduledJobRun.createMany({
      data: [{ jobName, scheduledFor: scheduledTick(now) }],
      skipDuplicates: true,
    });
    if (count === 0) return false;

    await this.prisma.scheduledJobRun.deleteMany({
      where: { jobName, scheduledFor: { lt: retentionCutoff(now) } },
    });
    return true;
  }
}
