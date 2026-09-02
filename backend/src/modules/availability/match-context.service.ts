import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export type MatchContext = {
  partnerName: string | null;
  anchor: Date;
};

@Injectable()
export class MatchContextService {
  constructor(private readonly prisma: PrismaService) {}

  async describe(matchId: string, userId: string): Promise<MatchContext> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        userA: { include: { profile: { select: { name: true } } } },
        userB: { include: { profile: { select: { name: true } } } },
      },
    });
    if (!match) {
      return { partnerName: null, anchor: new Date() };
    }

    const partner = match.userAId === userId ? match.userB : match.userA;
    return {
      partnerName: partner.profile?.name ?? null,
      anchor: match.createdAt,
    };
  }
}
