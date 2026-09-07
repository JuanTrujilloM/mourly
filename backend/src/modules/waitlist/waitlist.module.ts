import { Module } from '@nestjs/common';
import { WaitlistController } from './waitlist.controller';
import { AdminWaitlistController } from './admin-waitlist.controller';
import { WaitlistService } from './waitlist.service';

@Module({
  controllers: [WaitlistController, AdminWaitlistController],
  providers: [WaitlistService],
})
export class WaitlistModule {}
