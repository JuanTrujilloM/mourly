import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';
import {
  notificationsForPendingDate,
  type PendingDate,
} from './feedback-recipients';
import { PendingDateRepository } from './pending-date.repository';
import { FEEDBACK_WINDOW_CRON } from './feedback-window.constants';

const PARTICIPANTS = 2;

type FeedbackKind = 'feedback_request' | 'feedback_reminder';

@Injectable()
export class FeedbackWindowService {
  private readonly logger = new Logger(FeedbackWindowService.name);

  constructor(
    private readonly dates: PendingDateRepository,
    private readonly notifications: NotificationsService,
  ) {}

  @Cron(FEEDBACK_WINDOW_CRON)
  async runFeedbackCycle(): Promise<void> {
    const now = new Date();
    await this.requestPending(now);
    await this.remindPending(now);
    await this.dates.closeExpired(now);
  }

  async requestPending(now: Date): Promise<number> {
    const pending = await this.dates.findAwaitingRequest(now);

    for (const date of pending) {
      await this.announce(date, 'feedback_request');
      await this.dates.markRequested(date.id, now);
    }
    return pending.length;
  }

  async remindPending(now: Date): Promise<number> {
    const due = await this.dates.findAwaitingReminder(now);
    const unanswered = due.filter(
      (date) => date.feedbacks.length < PARTICIPANTS,
    );

    for (const date of unanswered) {
      await this.announce(date, 'feedback_reminder');
    }
    if (due.length > 0) {
      await this.dates.markReminded(
        due.map((date) => date.id),
        now,
      );
    }
    return unanswered.length;
  }

  private async announce(
    date: PendingDate & { id: string },
    kind: FeedbackKind,
  ): Promise<void> {
    try {
      for (const notification of notificationsForPendingDate(date, kind)) {
        await this.notifications.send(notification);
      }
    } catch (error) {
      this.logger.error(
        `Could not send ${kind} for date ${date.id}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
