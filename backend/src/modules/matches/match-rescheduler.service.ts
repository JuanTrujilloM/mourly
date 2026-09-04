import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { AvailabilityLinkService } from '../availability-link/availability-link.service';
import { NotificationsService } from '../notifications/notifications.service';
import { nameOf, recipientOf } from './match-recipients';
import type { LoadedMatch } from './match-loader.service';
import type { ConfirmResult } from './match-confirmation.types';
import {
  EXPIRED_MATCH_STATUS,
  MAX_SCHEDULE_ATTEMPTS,
  SCHEDULE_DEADLINE_HOURS,
} from './match-confirmation.constants';

const DEFAULT_FRONTEND_URL = 'http://localhost:3000';

@Injectable()
export class MatchReschedulerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly links: AvailabilityLinkService,
    private readonly notifications: NotificationsService,
  ) {}

  async handleNoOverlap(match: LoadedMatch): Promise<ConfirmResult> {
    if (match.scheduleAttempts >= MAX_SCHEDULE_ATTEMPTS) {
      return this.recycle(match);
    }

    await this.prisma.match.update({
      where: { id: match.id },
      data: {
        scheduleAttempts: { increment: 1 },
        scheduleDeadline: new Date(
          Date.now() + SCHEDULE_DEADLINE_HOURS * 60 * 60 * 1000,
        ),
      },
    });

    for (const [user, partner] of [
      [match.userA, match.userB],
      [match.userB, match.userA],
    ] as const) {
      await this.sendNudge(match.id, user, partner);
    }
    return 'nudged';
  }

  async recycle(match: LoadedMatch): Promise<ConfirmResult> {
    await this.prisma.match.update({
      where: { id: match.id },
      data: { status: EXPIRED_MATCH_STATUS },
    });
    await Promise.all([
      this.notifications.send({
        kind: 'rescheduling_failed',
        recipient: recipientOf(match.userA),
      }),
      this.notifications.send({
        kind: 'rescheduling_failed',
        recipient: recipientOf(match.userB),
      }),
    ]);
    return 'recycled';
  }

  private async sendNudge(
    matchId: string,
    user: LoadedMatch['userA'],
    partner: LoadedMatch['userB'],
  ): Promise<void> {
    const token = await this.links.issueForMatchUser(
      matchId,
      user.id,
      'AVAILABILITY',
    );
    await this.notifications.send({
      kind: 'more_availability',
      recipient: recipientOf(user),
      partnerName: nameOf(partner),
      availabilityUrl: `${this.frontendUrl()}/availability/${token}`,
    });
  }

  private frontendUrl(): string {
    return this.config.get<string>('FRONTEND_URL') ?? DEFAULT_FRONTEND_URL;
  }
}
