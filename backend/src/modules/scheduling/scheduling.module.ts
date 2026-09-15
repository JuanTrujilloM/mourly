import { Module } from '@nestjs/common';
import { JobClaimService } from './job-claim.service';

@Module({
  providers: [JobClaimService],
  exports: [JobClaimService],
})
export class SchedulingModule {}
