import { Module } from '@nestjs/common';
import { MatchesModule } from '../matches/matches.module';
import { StorageModule } from '../storage/storage.module';
import { AdminController } from './admin.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminMatchesService } from './admin-matches.service';
import { AdminMatchDetailService } from './admin-match-detail.service';
import { AdminModerationService } from './admin-moderation.service';
import { AdminStatsService } from './admin-stats.service';
import { AdminOperationsService } from './admin-operations.service';
import { AdminReviewAccountService } from './admin-review-account.service';

@Module({
  imports: [MatchesModule, StorageModule],
  controllers: [AdminController],
  providers: [
    AdminUsersService,
    AdminMatchesService,
    AdminMatchDetailService,
    AdminModerationService,
    AdminStatsService,
    AdminOperationsService,
    AdminReviewAccountService,
  ],
})
export class AdminModule {}
