import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { partnerSummary } from './admin.mappers';

@Injectable()
export class AdminModerationService {
  constructor(private readonly prisma: PrismaService) {}

  async listFeedback() {
    const feedback = await this.prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { include: { profile: true } },
        date: { include: { venue: true } },
      },
    });

    return feedback.map((entry) => ({
      id: entry.id,
      occurred: entry.occurred,
      rating: entry.rating,
      comments: entry.comments,
      noShowReason: entry.noShowReason,
      amountSpent: entry.amountSpent,
      createdAt: entry.createdAt,
      userName: entry.user.profile?.name ?? entry.user.email,
      venueName: entry.date.venue.name,
      scheduledAt: entry.date.scheduledAt,
    }));
  }

  async listReports() {
    const reports = await this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        userA: { include: { profile: true } },
        userB: { include: { profile: true } },
      },
    });

    return reports.map((report) => ({
      id: report.id,
      createdAt: report.createdAt,
      reporter: partnerSummary(report.userA),
      reported: partnerSummary(report.userB),
    }));
  }
}
