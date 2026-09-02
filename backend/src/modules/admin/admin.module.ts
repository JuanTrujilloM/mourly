import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminMatchesService } from './admin-matches.service';
import { AdminModerationService } from './admin-moderation.service';

@Module({
  controllers: [AdminController],
  providers: [AdminUsersService, AdminMatchesService, AdminModerationService],
})
export class AdminModule {}
