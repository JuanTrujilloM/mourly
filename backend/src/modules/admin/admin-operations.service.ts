import { Injectable, Logger } from '@nestjs/common';
import { WeeklyMatchingService } from '../matches/weekly-matching.service';
import { MatchInviteService } from '../matches/match-invite.service';

@Injectable()
export class AdminOperationsService {
  private readonly logger = new Logger(AdminOperationsService.name);

  constructor(
    private readonly weekly: WeeklyMatchingService,
    private readonly invites: MatchInviteService,
  ) {}

  async runWeeklyMatching() {
    const pairs = await this.weekly.runWeeklyMatching();
    this.logger.log(`Manual matching run created ${pairs.length} match(es).`);
    await this.invites.inviteForPairs(pairs);

    return {
      created: pairs.length,
      pairs: pairs.map((pair) => ({
        userAId: pair.userAId,
        userBId: pair.userBId,
        compatibilityScore: pair.compatibilityScore,
      })),
    };
  }
}
