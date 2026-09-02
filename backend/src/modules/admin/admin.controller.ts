import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminUsersService } from './admin-users.service';
import { AdminMatchesService } from './admin-matches.service';
import { AdminModerationService } from './admin-moderation.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly users: AdminUsersService,
    private readonly matches: AdminMatchesService,
    private readonly moderation: AdminModerationService,
  ) {}

  @Get('users')
  listUsers() {
    return this.users.listUsers();
  }

  @Patch('users/:id/status')
  setUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.users.setUserStatus(id, dto.status);
  }

  @Patch('users/:id/verify')
  verifyUser(@Param('id') id: string) {
    return this.users.verifyUser(id);
  }

  @Get('matches')
  listMatches() {
    return this.matches.listMatches();
  }

  @Get('matches/:id')
  getMatch(@Param('id') id: string) {
    return this.matches.getMatchDetail(id);
  }

  @Patch('matches/:id/cancel')
  cancelMatch(@Param('id') id: string) {
    return this.matches.cancelMatch(id);
  }

  @Get('feedback')
  listFeedback() {
    return this.moderation.listFeedback();
  }

  @Get('reports')
  listReports() {
    return this.moderation.listReports();
  }
}
