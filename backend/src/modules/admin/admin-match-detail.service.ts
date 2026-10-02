import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { PhotoUrlService } from '../storage/photo-url.service';
import { MATCH_NOT_FOUND_MESSAGE } from './admin-messages';
import { PROFILE_DETAIL_INCLUDE } from './admin-user-detail.mapper';
import { toMatchDetail } from './match-detail.mapper';

@Injectable()
export class AdminMatchDetailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly photoUrls: PhotoUrlService,
  ) {}

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

    const [feedback, userAPhotos, userBPhotos] = await Promise.all([
      this.feedbackFor(match.date?.id),
      this.photoUrls.orderedUrls(match.userA.profile?.photos),
      this.photoUrls.orderedUrls(match.userB.profile?.photos),
    ]);
    return toMatchDetail(match, feedback, {
      userA: userAPhotos,
      userB: userBPhotos,
    });
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
