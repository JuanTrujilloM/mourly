import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../config/prisma.service';
import { ACTIVE_MATCH_STATUSES } from '../chatbot/user-context/match-status';
import { MatchResponseService } from './match-response.service';
import {
  RESPONSE_TIMEOUT_CRON,
  RESPONSE_TIMEOUT_HOURS,
} from './match-response.constants';

const HOUR_IN_MS = 3600 * 1000;

@Injectable()
export class MatchTimeoutService {
  private readonly logger = new Logger(MatchTimeoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly responses: MatchResponseService,
  ) {}

  @Cron(RESPONSE_TIMEOUT_CRON)
  async rejectStaleMatches(): Promise<void> {
    const cutoff = new Date(Date.now() - RESPONSE_TIMEOUT_HOURS * HOUR_IN_MS);
    const stale = await this.prisma.match.findMany({
      where: {
        status: { in: [...ACTIVE_MATCH_STATUSES] },
        date: { is: null },
        createdAt: { lt: cutoff },
      },
      select: { id: true, userAId: true, userBId: true },
    });

    for (const match of stale) {
      try {
        await this.responses.terminate(match.id, null);
        await Promise.all([
          this.responses.notifyRejected(match.userAId),
          this.responses.notifyRejected(match.userBId),
        ]);
      } catch (error) {
        this.logger.error(
          `Failed to time out match ${match.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }
}
