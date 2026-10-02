import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { partnerSummary } from './admin.mappers';
import { MATCH_NOT_FOUND_MESSAGE } from './admin-messages';

const CANCELED_STATUS = 'canceled';

@Injectable()
export class AdminMatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async listMatches() {
    const matches = await this.prisma.match.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        userA: { include: { profile: true } },
        userB: { include: { profile: true } },
        date: { include: { venue: true } },
      },
    });

    return matches.map((match) => ({
      id: match.id,
      status: match.status,
      compatibilityScore: match.compatibilityScore,
      createdAt: match.createdAt,
      userA: partnerSummary(match.userA),
      userB: partnerSummary(match.userB),
      date: match.date
        ? {
            scheduledAt: match.date.scheduledAt,
            status: match.date.status,
            venueName: match.date.venue.name,
          }
        : null,
    }));
  }

  async cancelMatch(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });
    if (!match) {
      throw new NotFoundException(MATCH_NOT_FOUND_MESSAGE);
    }

    await this.prisma.match.update({
      where: { id: matchId },
      data: { status: CANCELED_STATUS },
    });
    return { id: matchId, status: CANCELED_STATUS };
  }
}
