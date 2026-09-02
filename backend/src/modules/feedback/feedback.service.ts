import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { COMPLETED_DATE_STATUS } from './feedback.constants';
import {
  assertAnswerIsCoherent,
  assertDateAlreadyHappened,
} from './feedback-rules';

const PARTICIPANTS = 2;

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(userId: string, dateId: string, dto: CreateFeedbackDto) {
    const date = await this.requireParticipantDate(dateId, userId);
    assertDateAlreadyHappened(date.scheduledAt, new Date());
    assertAnswerIsCoherent(dto);
    await this.assertNotAnsweredYet(dateId, userId);

    const feedback = await this.prisma.feedback.create({
      data: {
        dateId,
        userId,
        occurred: dto.occurred,
        rating: dto.rating ?? null,
        comments: dto.comments ?? null,
        noShowReason: dto.noShowReason ?? null,
        amountSpent: dto.amountSpent ?? null,
      },
    });

    await this.completeDateWhenBothAnswered(dateId);
    return feedback;
  }

  private async requireParticipantDate(dateId: string, userId: string) {
    const date = await this.prisma.date.findFirst({
      where: {
        id: dateId,
        match: { OR: [{ userAId: userId }, { userBId: userId }] },
      },
      select: { id: true, scheduledAt: true },
    });
    if (!date) {
      throw new NotFoundException('Date not found.');
    }
    return date;
  }

  private async assertNotAnsweredYet(dateId: string, userId: string) {
    const existing = await this.prisma.feedback.findUnique({
      where: { dateId_userId: { dateId, userId } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('You already rated this date.');
    }
  }

  private async completeDateWhenBothAnswered(dateId: string) {
    const answers = await this.prisma.feedback.count({ where: { dateId } });
    if (answers < PARTICIPANTS) {
      return;
    }
    await this.prisma.date.update({
      where: { id: dateId },
      data: { status: COMPLETED_DATE_STATUS },
    });
  }
}
