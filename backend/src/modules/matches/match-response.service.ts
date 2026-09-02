import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { activeMatchWhere } from './active-match.query';
import { recipientOf } from './match-recipients';
import { REJECTED_MATCH_STATUS } from './match-response.constants';

export type RejectResult = 'rejected' | 'no_active_match';

@Injectable()
export class MatchResponseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async reject(userId: string): Promise<RejectResult> {
    const match = await this.prisma.match.findFirst({
      where: activeMatchWhere(userId),
      orderBy: { createdAt: 'desc' },
      select: { id: true, userAId: true, userBId: true },
    });
    if (!match) {
      return 'no_active_match';
    }

    const otherUserId =
      match.userAId === userId ? match.userBId : match.userAId;
    await this.terminate(match.id, userId);
    await this.notifyRejected(otherUserId);
    return 'rejected';
  }

  async terminate(matchId: string, rejectedById: string | null): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.date.deleteMany({ where: { matchId } }),
      this.prisma.match.update({
        where: { id: matchId },
        data: {
          status: REJECTED_MATCH_STATUS,
          rejectedById,
          rejectedAt: new Date(),
        },
      }),
    ]);
  }

  async notifyRejected(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        cellphone: true,
        profile: { select: { name: true } },
      },
    });
    if (!user) {
      return;
    }
    await this.notifications.send({
      kind: 'match_rejected',
      recipient: recipientOf(user),
    });
  }
}
