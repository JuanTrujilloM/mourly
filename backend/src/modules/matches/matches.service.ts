import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { activeMatchWhere } from './active-match.query';
import { toPartnerSummary } from './partner.mapper';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentMatch(userId: string) {
    const match = await this.prisma.match.findFirst({
      where: activeMatchWhere(userId),
      orderBy: { createdAt: 'desc' },
      include: {
        userA: { include: { profile: { include: { photos: true } } } },
        userB: { include: { profile: { include: { photos: true } } } },
      },
    });
    if (!match) {
      return null;
    }

    const partner = match.userAId === userId ? match.userB : match.userA;
    return {
      id: match.id,
      status: match.status,
      partner: toPartnerSummary(partner),
    };
  }
}
