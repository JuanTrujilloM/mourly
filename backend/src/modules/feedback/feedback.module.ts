import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { FeedbackWindowService } from './feedback-window.service';
import { PendingDateRepository } from './pending-date.repository';

@Module({
  imports: [NotificationsModule, SchedulingModule],
  controllers: [FeedbackController],
  providers: [FeedbackService, FeedbackWindowService, PendingDateRepository],
})
export class FeedbackModule {}
