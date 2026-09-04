import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { VenuesService } from '../venues/venues.service';

type Venue = Awaited<ReturnType<VenuesService['findActive']>>[number];

@Injectable()
export class VenueRankingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly venues: VenuesService,
  ) {}

  async rankForPair(userAId: string, userBId: string): Promise<Venue[]> {
    const shared = await this.sharedInterests(userAId, userBId);
    const venues = await this.venues.findActive();

    return [...venues].sort((a, b) => {
      const byTags = this.tagScore(b, shared) - this.tagScore(a, shared);
      if (byTags !== 0) {
        return byTags;
      }
      const bySpend = a.averageSpentPerPerson - b.averageSpentPerPerson;
      return bySpend !== 0 ? bySpend : a.name.localeCompare(b.name);
    });
  }

  private tagScore(venue: Venue, shared: Set<string>): number {
    return venue.tags.filter((tag) => shared.has(tag.toLowerCase())).length;
  }

  private async sharedInterests(
    userAId: string,
    userBId: string,
  ): Promise<Set<string>> {
    const [a, b] = await Promise.all([
      this.hobbyNames(userAId),
      this.hobbyNames(userBId),
    ]);
    const other = new Set(b);
    return new Set(a.filter((name) => other.has(name)));
  }

  private async hobbyNames(userId: string): Promise<string[]> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { hobbies: { include: { hobby: true } } },
    });
    return (
      profile?.hobbies.map((entry) => entry.hobby.name.toLowerCase()) ?? []
    );
  }
}
