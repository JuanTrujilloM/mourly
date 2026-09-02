import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { partnerSummary } from './admin.mappers';
import { PROFILE_DETAIL_INCLUDE } from './admin-user-detail.mapper';
import { toMatchDetail } from './match-detail.mapper';

const CANCELED_STATUS = 'canceled';
const MATCH_NOT_FOUND_MESSAGE = 'Match not found.';

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

  async getMatchDetail(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        userA: {
          include: { profile: PROFILE_DETAIL_INCLUDE, preferences: true },
        },
        userB: {
          include: { profile: PROFILE_DETAIL_INCLUDE, preferences: true },
        },
        date: { include: { venue: true } },
        venueOptions: { include: { venue: true } },
        availabilities: true,
      },
    });
    if (!match) {
      throw new NotFoundException(MATCH_NOT_FOUND_MESSAGE);
    }

    return toMatchDetail(match, await this.feedbackFor(match.date?.id));
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

  private async feedbackFor(dateId?: string) {
    if (!dateId) {
      return [];
    }

    const feedback = await this.prisma.feedback.findMany({
      where: { dateId },
      include: { user: { include: { profile: true } } },
    });

    return feedback.map((entry) => ({
      userName: entry.user.profile?.name ?? entry.user.email,
      occurred: entry.occurred,
      rating: entry.rating,
      comments: entry.comments,
      noShowReason: entry.noShowReason,
      amountSpent: entry.amountSpent,
    }));
  }
}
