import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { AvailabilityLinkIssuerService } from '../availability-link/availability-link-issuer.service';
import { NotificationsService } from '../notifications/notifications.service';
import { buildPartnerSummary } from '../notifications/partner-summary';
import { recipientOf } from './match-recipients';
import { PhotoUrlService } from '../storage/photo-url.service';
import {
  MATCH_WITH_USERS_SELECT,
  type InviteResult,
  type InviteUser,
  type MatchWithUsers,
} from './invite-user.query';
import { MatchPair } from './engine/types';

const DEFAULT_FRONTEND_URL = 'http://localhost:3000';
const HOURS_PER_DAY = 24;

@Injectable()
export class MatchInviteService {
  private readonly logger = new Logger(MatchInviteService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly links: AvailabilityLinkIssuerService,
    private readonly notifications: NotificationsService,
    private readonly photoUrls: PhotoUrlService,
  ) {}

  async inviteForPairs(pairs: MatchPair[]): Promise<void> {
    for (const pair of pairs) {
      const match = await this.prisma.match.findFirst({
        where: { userAId: pair.userAId, userBId: pair.userBId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });
      if (match) {
        await this.inviteForMatch(match.id);
      }
    }
  }

  async inviteForMatch(matchId: string): Promise<InviteResult[]> {
    const match = await this.loadMatch(matchId);
    if (!match) {
      return [];
    }

    const results: InviteResult[] = [];
    for (const [user, partner] of [
      [match.userA, match.userB],
      [match.userB, match.userA],
    ] as const) {
      try {
        results.push(await this.inviteUser(match.id, user, partner));
      } catch (error) {
        this.logger.error(
          `Failed to send availability invite to user ${user.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
    return results;
  }

  private async inviteUser(
    matchId: string,
    user: InviteUser,
    partner: InviteUser,
  ): Promise<InviteResult> {
    const token = await this.links.issueForMatchUser(matchId, user.id);
    const url = `${this.frontendUrl()}/flow/${token}`;
    const photoUrl = await this.photoUrls.primaryUrl(
      partner.profile?.photos,
      'email',
    );

    await this.notifications.send({
      kind: 'match_invite',
      recipient: recipientOf(user),
      partner: buildPartnerSummary(partner.profile, photoUrl),
      availabilityUrl: url,
      expiresInDays: Math.ceil(this.links.ttlHours() / HOURS_PER_DAY),
    });
    return { userId: user.id, cellphone: user.cellphone, url };
  }

  private loadMatch(matchId: string): Promise<MatchWithUsers | null> {
    return this.prisma.match.findUnique({
      where: { id: matchId },
      select: MATCH_WITH_USERS_SELECT,
    });
  }

  private frontendUrl(): string {
    return this.config.get<string>('FRONTEND_URL') ?? DEFAULT_FRONTEND_URL;
  }
}
