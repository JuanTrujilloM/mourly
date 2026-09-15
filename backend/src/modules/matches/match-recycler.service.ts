import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MatchLoaderService } from './match-loader.service';
import { MatchReschedulerService } from './match-rescheduler.service';
import { RECYCLE_CRON } from './match-confirmation.constants';
import { JobClaimService } from '../scheduling/job-claim.service';
import { SCHEDULED_JOBS } from '../scheduling/scheduled-jobs';

@Injectable()
export class MatchRecyclerService {
  private readonly logger = new Logger(MatchRecyclerService.name);

  constructor(
    private readonly loader: MatchLoaderService,
    private readonly rescheduler: MatchReschedulerService,
    private readonly jobs: JobClaimService,
  ) {}

  @Cron(RECYCLE_CRON)
  async recycleExpired(): Promise<void> {
    if (!(await this.jobs.claim(SCHEDULED_JOBS.matchRecycling))) return;
    const overdue = await this.loader.loadOverdue(new Date());

    for (const match of overdue) {
      try {
        await this.rescheduler.recycle(match);
      } catch (error) {
        this.logger.error(
          `Could not recycle match ${match.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }
}
