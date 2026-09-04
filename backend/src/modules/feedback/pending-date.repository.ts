import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { PENDING_DATE_SELECT } from './pending-date.query';
import {
  FEEDBACK_CLOSE_DELAY_HOURS,
  FEEDBACK_REMINDER_DELAY_HOURS,
  FEEDBACK_REQUEST_DELAY_HOURS,
  hoursBefore,
} from './feedback-window.constants';

@Injectable()
export class PendingDateRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAwaitingRequest(now: Date) {
    return this.prisma.date.findMany({
      where: {
        feedbackRequestedAt: null,
        feedbackClosedAt: null,
        scheduledAt: { lte: hoursBefore(now, FEEDBACK_REQUEST_DELAY_HOURS) },
      },
      select: PENDING_DATE_SELECT,
    });
  }

  findAwaitingReminder(now: Date) {
    return this.prisma.date.findMany({
      where: {
        feedbackReminderAt: null,
        feedbackClosedAt: null,
        feedbackRequestedAt: {
          lte: hoursBefore(now, FEEDBACK_REMINDER_DELAY_HOURS),
        },
      },
      select: PENDING_DATE_SELECT,
    });
  }

  markRequested(id: string, now: Date) {
    return this.prisma.date.update({
      where: { id },
      data: { feedbackRequestedAt: now },
    });
  }

  markReminded(ids: string[], now: Date) {
    return this.prisma.date.updateMany({
      where: { id: { in: ids } },
      data: { feedbackReminderAt: now },
    });
  }

  async closeExpired(now: Date): Promise<number> {
    const result = await this.prisma.date.updateMany({
      where: {
        feedbackClosedAt: null,
        feedbackReminderAt: {
          lte: hoursBefore(now, FEEDBACK_CLOSE_DELAY_HOURS),
        },
      },
      data: { feedbackClosedAt: now },
    });
    return result.count;
  }
}
