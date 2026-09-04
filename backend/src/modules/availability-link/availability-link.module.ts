import { Module } from '@nestjs/common';
import { AvailabilityLinkService } from './availability-link.service';

@Module({
  providers: [AvailabilityLinkService],
  exports: [AvailabilityLinkService],
})
export class AvailabilityLinkModule {}
