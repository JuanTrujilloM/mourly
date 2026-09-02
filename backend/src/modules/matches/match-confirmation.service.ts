import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MatchLoaderService, type LoadedMatch } from './match-loader.service';
import { MatchReschedulerService } from './match-rescheduler.service';
import { nameOf, recipientOf } from './match-recipients';
import {
  bothCompleted,
  commonVenueId,
  earliestCommonSlot,
  isActiveStatus,
  venueById,
  type CommonSlot,
} from './match-scheduling';
import type { ConfirmResult } from './match-confirmation.types';
import {
  CONFIRMED_MATCH_STATUS,
  DATE_ACCEPTED_STATUS,
} from './match-confirmation.constants';

@Injectable()
export class MatchConfirmationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loader: MatchLoaderService,
    private readonly notifications: NotificationsService,
    private readonly rescheduler: MatchReschedulerService,
  ) {}

  async tryConfirm(matchId: string): Promise<ConfirmResult> {
    const match = await this.loader.loadById(matchId);
    if (!match) {
      return 'waiting';
    }
    if (match.date || !isActiveStatus(match.status)) {
      return 'already_scheduled';
    }
    if (!bothCompleted(match)) {
      return 'waiting';
    }

    const slot = earliestCommonSlot(match);
    const venueId = commonVenueId(match);
    return slot && venueId
      ? this.createDate(match, slot, venueId)
      : this.rescheduler.handleNoOverlap(match);
  }

  private async createDate(
    match: LoadedMatch,
    slot: CommonSlot,
    venueId: string,
  ): Promise<ConfirmResult> {
    try {
      await this.prisma.$transaction([
        this.prisma.date.create({
          data: {
            matchId: match.id,
            venueId,
            scheduledAt: slot.scheduledAt,
            status: DATE_ACCEPTED_STATUS,
          },
        }),
        this.prisma.match.update({
          where: { id: match.id },
          data: { status: CONFIRMED_MATCH_STATUS },
        }),
      ]);
    } catch {
      return 'already_scheduled';
    }

    await this.announce(match, slot, venueById(match, venueId));
    return 'confirmed';
  }

  private announce(
    match: LoadedMatch,
    slot: CommonSlot,
    venue: { name: string; address: string },
  ): Promise<unknown> {
    return Promise.all(
      [
        [match.userA, match.userB],
        [match.userB, match.userA],
      ].map(([user, partner]) =>
        this.notifications.send({
          kind: 'date_proposal',
          recipient: recipientOf(user),
          partnerName: nameOf(partner),
          whenText: slot.label,
          venueName: venue.name,
          venueAddress: venue.address,
        }),
      ),
    );
  }
}
