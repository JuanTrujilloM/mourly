import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ACTIVE_MATCH_STATUSES } from '../chatbot/user-context/match-status';

@Injectable()
export class AdminStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const [users, verified, onboarded, byUniversity, matches, dates, feedback] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isVerified: true } }),
        this.prisma.profile.count({ where: { user: { isVerified: true } } }),
        this.prisma.profile.groupBy({
          by: ['university'],
          _count: { university: true },
        }),
        this.prisma.match.groupBy({ by: ['status'], _count: { status: true } }),
        this.prisma.date.groupBy({ by: ['status'], _count: { status: true } }),
        this.prisma.feedback.count({ where: { occurred: true } }),
      ]);

    const totalMatches = matches.reduce(
      (sum, row) => sum + row._count.status,
      0,
    );
    const totalDates = dates.reduce((sum, row) => sum + row._count.status, 0);

    return {
      users: {
        total: users,
        verified,
        onboarded,
        byUniversity: byUniversity.map((row) => ({
          university: row.university,
          count: row._count.university,
        })),
      },
      matches: {
        total: totalMatches,
        active: await this.countActiveMatches(),
        byStatus: this.toStatusMap(matches),
      },
      dates: {
        total: totalDates,
        byStatus: this.toStatusMap(dates),
        attendedFeedback: feedback,
        matchToDateRate: totalMatches === 0 ? 0 : totalDates / totalMatches,
      },
    };
  }

  private countActiveMatches() {
    return this.prisma.match.count({
      where: { status: { in: [...ACTIVE_MATCH_STATUSES] } },
    });
  }

  private toStatusMap(rows: { status: string; _count: { status: number } }[]) {
    return Object.fromEntries(
      rows.map((row) => [row.status, row._count.status]),
    );
  }
}
