import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class MatchHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async priorPartnersByUser(
    userIds: string[],
  ): Promise<Map<string, Set<string>>> {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ userAId: { in: userIds } }, { userBId: { in: userIds } }],
      },
      select: { userAId: true, userBId: true },
    });

    const partners = new Map<string, Set<string>>();
    const link = (owner: string, partner: string) => {
      const existing = partners.get(owner) ?? new Set<string>();
      existing.add(partner);
      partners.set(owner, existing);
    };

    for (const match of matches) {
      link(match.userAId, match.userBId);
      link(match.userBId, match.userAId);
    }
    return partners;
  }

  async reliabilityByUser(userIds: string[]): Promise<Map<string, number>> {
    const feedbacks = await this.prisma.feedback.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, occurred: true },
    });

    const totals = new Map<string, { attended: number; total: number }>();
    for (const feedback of feedbacks) {
      const entry = totals.get(feedback.userId) ?? { attended: 0, total: 0 };
      entry.total += 1;
      if (feedback.occurred) {
        entry.attended += 1;
      }
      totals.set(feedback.userId, entry);
    }

    const reliability = new Map<string, number>();
    for (const [userId, { attended, total }] of totals) {
      reliability.set(userId, (2 * attended - total) / total);
    }
    return reliability;
  }
}
