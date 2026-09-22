import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { MatchLoaderService, type LoadedMatch } from './match-loader.service';
import { MatchReschedulerService } from './match-rescheduler.service';
import { DateAnnouncerService } from './date-announcer.service';
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
    private readonly rescheduler: MatchReschedulerService,
    private readonly announcer: DateAnnouncerService,
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

    await this.announcer.announce(match, slot, venueById(match, venueId));
    return 'confirmed';
  }
}
