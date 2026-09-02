import { Injectable } from '@nestjs/common';
import { VenueSelectionService } from '../matches/venue-selection.service';
import { MIN_VENUE_SELECTION } from '../matches/matches.constants';
import { AvailabilityLinkResolver } from './availability-link-resolver.service';
import { MatchContextService } from './match-context.service';
import { buildCalendarDays } from './availability-calendar';
import { TIME_SLOTS } from './availability.constants';

@Injectable()
export class AvailabilityViewService {
  constructor(
    private readonly resolver: AvailabilityLinkResolver,
    private readonly matchContext: MatchContextService,
    private readonly venues: VenueSelectionService,
  ) {}

  async getAvailabilityView(token: string) {
    const link = await this.resolver.resolveForView(token);
    if (!link) {
      return { step: 'COMPLETED' as const };
    }
    if (link.step === 'VENUE') {
      return { step: 'VENUE' as const };
    }

    const context = await this.matchContext.describe(link.matchId, link.userId);
    return {
      step: 'AVAILABILITY' as const,
      partnerName: context.partnerName,
      days: buildCalendarDays(context.anchor),
      timeSlots: [...TIME_SLOTS],
    };
  }

  async getVenuesView(token: string) {
    const link = await this.resolver.resolveForView(token);
    if (!link) {
      return { step: 'COMPLETED' as const };
    }
    if (link.step !== 'VENUE') {
      return { step: 'AVAILABILITY' as const };
    }

    const context = await this.matchContext.describe(link.matchId, link.userId);
    return {
      step: 'VENUE' as const,
      partnerName: context.partnerName,
      minSelection: MIN_VENUE_SELECTION,
      venues: await this.venues.getSuggestions(link.matchId, link.userId),
    };
  }
}
