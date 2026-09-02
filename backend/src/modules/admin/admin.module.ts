import { Module } from '@nestjs/common';
import { MatchesModule } from '../matches/matches.module';
import { AdminController } from './admin.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminMatchesService } from './admin-matches.service';
import { AdminModerationService } from './admin-moderation.service';
import { AdminStatsService } from './admin-stats.service';
import { AdminOperationsService } from './admin-operations.service';

@Module({
  imports: [MatchesModule],
  controllers: [AdminController],
  providers: [
    AdminUsersService,
    AdminMatchesService,
    AdminModerationService,
    AdminStatsService,
    AdminOperationsService,
  ],
})
export class AdminModule {}
