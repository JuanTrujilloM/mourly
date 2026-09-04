import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { VenueRankingService } from './venue-ranking.service';
import { toPublicVenue } from './venue.mapper';
import { SUGGESTION_COUNT } from './matches.constants';
import * as messages from './venue-selection.messages';

@Injectable()
export class VenueSelectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ranking: VenueRankingService,
  ) {}

  async getSuggestions(matchId: string, userId: string) {
    const match = await this.requireMatch(matchId);
    const isUserA = match.userAId === userId;

    let options = await this.optionsFor(matchId);
    if (options.length === 0) {
      await this.createOptions(match);
      options = await this.optionsFor(matchId);
    }

    return options.map((option) => ({
      ...toPublicVenue(option.venue),
      selected: isUserA ? option.userASelected : option.userBSelected,
    }));
  }

  async select(matchId: string, userId: string, venueIds: string[]) {
    const match = await this.requireMatch(matchId);
    const isUserA = match.userAId === userId;

    const options = await this.prisma.venueOption.findMany({
      where: { matchId },
    });
    const suggested = new Set(options.map((option) => option.venueId));
    if (options.length === 0 || !venueIds.every((id) => suggested.has(id))) {
      throw new BadRequestException(messages.INVALID_SELECTION_MESSAGE);
    }

    await this.prisma.$transaction([
      this.prisma.venueOption.updateMany({
        where: { matchId, venueId: { in: venueIds } },
        data: isUserA ? { userASelected: true } : { userBSelected: true },
      }),
      this.prisma.venueOption.updateMany({
        where: { matchId, venueId: { notIn: venueIds } },
        data: isUserA ? { userASelected: false } : { userBSelected: false },
      }),
    ]);

    return { selectedVenueIds: venueIds };
  }

  private async createOptions(match: {
    id: string;
    userAId: string;
    userBId: string;
  }): Promise<void> {
    const ranked = await this.ranking.rankForPair(match.userAId, match.userBId);
    if (ranked.length < SUGGESTION_COUNT) {
      throw new BadRequestException(messages.NOT_ENOUGH_VENUES_MESSAGE);
    }

    await this.prisma.venueOption.createMany({
      data: ranked.slice(0, SUGGESTION_COUNT).map((venue) => ({
        matchId: match.id,
        userAId: match.userAId,
        userBId: match.userBId,
        venueId: venue.id,
      })),
      skipDuplicates: true,
    });
  }

  private optionsFor(matchId: string) {
    return this.prisma.venueOption.findMany({
      where: { matchId },
      include: { venue: true },
    });
  }

  private async requireMatch(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });
    if (!match) {
      throw new NotFoundException(messages.MATCH_NOT_FOUND_MESSAGE);
    }
    return match;
  }
}
