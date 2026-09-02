import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { MatchesService } from './matches.service';
import { MatchResponseService } from './match-response.service';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly responses: MatchResponseService,
  ) {}

  @Get('current')
  getCurrent(@CurrentUser() user: AuthenticatedUser) {
    return this.matchesService.getCurrentMatch(user.userId);
  }

  @Post('current/reject')
  @HttpCode(HttpStatus.OK)
  async rejectCurrent(@CurrentUser() user: AuthenticatedUser) {
    const result = await this.responses.reject(user.userId);
    if (result === 'no_active_match') {
      throw new NotFoundException('You have no active match.');
    }
    return { status: result };
  }
}
