import {
  BadRequestException,
  GoneException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { VenueSelectionService } from '../matches/venue-selection.service';
import { MatchConfirmationService } from '../matches/match-confirmation.service';
import { AvailabilityLinkService } from '../availability-link/availability-link.service';
import { AvailabilityLinkResolver } from './availability-link-resolver.service';
import { MatchContextService } from './match-context.service';
import { validateSlots } from './slot-validator';
import { SlotSelectionDto } from './dto/submit-availability.dto';

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly links: AvailabilityLinkService,
    private readonly resolver: AvailabilityLinkResolver,
    private readonly matchContext: MatchContextService,
    private readonly venues: VenueSelectionService,
    private readonly confirmation: MatchConfirmationService,
  ) {}

  async submitAvailability(token: string, slots: SlotSelectionDto[]) {
    const link = await this.resolver.resolveOrThrow(token);
    if (link.step !== 'AVAILABILITY') {
      throw new BadRequestException('Primero elige tus lugares.');
    }

    const context = await this.matchContext.describe(link.matchId, link.userId);
    const rows = validateSlots(slots, context.anchor, {
      matchId: link.matchId,
      userId: link.userId,
    });

    await this.prisma.$transaction([
      this.prisma.availability.deleteMany({
        where: { matchId: link.matchId, userId: link.userId },
      }),
      this.prisma.availability.createMany({ data: rows }),
    ]);
    await this.links.consume(link.id);
    await this.tryConfirm(link.matchId);

    return { step: 'COMPLETED' as const };
  }

  async selectVenues(token: string, venueIds: string[]) {
    const link = await this.resolver.resolveOrThrow(token);
    if (link.step !== 'VENUE') {
      throw new GoneException('Ya elegiste tus lugares.');
    }

    const result = await this.venues.select(
      link.matchId,
      link.userId,
      venueIds,
    );
    await this.links.setStep(link.id, 'AVAILABILITY');
    return { step: 'AVAILABILITY' as const, ...result };
  }

  private async tryConfirm(matchId: string): Promise<void> {
    try {
      await this.confirmation.tryConfirm(matchId);
    } catch (error) {
      this.logger.error(
        `Confirmation check failed for match ${matchId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
