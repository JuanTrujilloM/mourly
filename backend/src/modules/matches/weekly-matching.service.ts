import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../config/prisma.service';
import { CandidateLoaderService } from './candidate-loader.service';
import { MatchInviteService } from './match-invite.service';
import { stableMatch } from './engine/stable-matching';
import { MatchPair } from './engine/types';
import {
  GENERATED_MATCH_STATUS,
  WEEKLY_MATCHING_CRON,
  WEEKLY_MATCHING_TIMEZONE,
} from './weekly-matching.constants';

@Injectable()
export class WeeklyMatchingService {
  private readonly logger = new Logger(WeeklyMatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly candidates: CandidateLoaderService,
    private readonly invites: MatchInviteService,
  ) {}

  @Cron(WEEKLY_MATCHING_CRON, { timeZone: WEEKLY_MATCHING_TIMEZONE })
  async handleWeeklyCron(): Promise<void> {
    const created = await this.runWeeklyMatching();
    this.logger.log(`Weekly matching created ${created.length} match(es).`);
    await this.invites.inviteForPairs(created);
  }

  async runWeeklyMatching(): Promise<MatchPair[]> {
    const candidates = await this.candidates.load();
    const pairs = stableMatch(candidates);
    await this.persist(pairs);
    return pairs;
  }

  private async persist(pairs: MatchPair[]): Promise<void> {
    if (pairs.length === 0) {
      return;
    }

    await this.prisma.match.createMany({
      data: pairs.map((pair) => ({
        userAId: pair.userAId,
        userBId: pair.userBId,
        compatibilityScore: pair.compatibilityScore,
        status: GENERATED_MATCH_STATUS,
      })),
    });
  }
}
