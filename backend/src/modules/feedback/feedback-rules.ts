import { BadRequestException } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

export function assertDateAlreadyHappened(scheduledAt: Date, now: Date): void {
  if (scheduledAt.getTime() > now.getTime()) {
    throw new BadRequestException(
      'You can only rate a date once it has happened.',
    );
  }
}

export function assertAnswerIsCoherent(dto: CreateFeedbackDto): void {
  if (dto.occurred && dto.rating === undefined) {
    throw new BadRequestException('Rate the date from 1 to 5.');
  }
  if (!dto.occurred && dto.rating !== undefined) {
    throw new BadRequestException(
      'A date that did not happen cannot be rated.',
    );
  }
}
