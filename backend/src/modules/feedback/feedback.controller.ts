import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Controller('dates')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  @Post(':dateId/feedback')
  submit(
    @CurrentUser() user: AuthenticatedUser,
    @Param('dateId') dateId: string,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.feedback.submit(user.userId, dateId, dto);
  }
}
