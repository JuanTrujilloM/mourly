import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MatchLoaderService } from './match-loader.service';
import { MatchReschedulerService } from './match-rescheduler.service';
import { RECYCLE_CRON } from './match-confirmation.constants';

@Injectable()
export class MatchRecyclerService {
  private readonly logger = new Logger(MatchRecyclerService.name);

  constructor(
    private readonly loader: MatchLoaderService,
    private readonly rescheduler: MatchReschedulerService,
  ) {}

  @Cron(RECYCLE_CRON)
  async recycleExpired(): Promise<void> {
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
