import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ACTIVE_MATCH_STATUSES } from '../chatbot/user-context/match-status';
import { MatchHistoryService } from './match-history.service';
import { toCandidate } from './candidate.mapper';
import { MatchCandidate } from './engine/types';
import { SEARCHING_PROFILE_STATUS } from './weekly-matching.constants';

@Injectable()
export class CandidateLoaderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly history: MatchHistoryService,
  ) {}

  async load(): Promise<MatchCandidate[]> {
    const users = await this.prisma.user.findMany({
      where: {
        isVerified: true,
        profile: { is: { status: SEARCHING_PROFILE_STATUS } },
        preferences: { isNot: null },
        matchesAsUserA: {
          none: { status: { in: [...ACTIVE_MATCH_STATUSES] } },
        },
        matchesAsUserB: {
          none: { status: { in: [...ACTIVE_MATCH_STATUSES] } },
        },
      },
      include: {
        profile: { include: { hobbies: { include: { hobby: true } } } },
        preferences: true,
      },
    });

    const eligible = users.filter((user) => user.profile && user.preferences);
    const userIds = eligible.map((user) => user.id);

    const [priorPartners, reliability] = await Promise.all([
      this.history.priorPartnersByUser(userIds),
      this.history.reliabilityByUser(userIds),
    ]);

    return eligible.map((user) =>
      toCandidate(
        user,
        priorPartners.get(user.id) ?? new Set<string>(),
        reliability.get(user.id) ?? 0,
      ),
    );
  }
}
