import { Module } from '@nestjs/common';
import { AvailabilityLinkIssuerService } from './availability-link-issuer.service';
import { AvailabilityLinkService } from './availability-link.service';

@Module({
  providers: [AvailabilityLinkService, AvailabilityLinkIssuerService],
  exports: [AvailabilityLinkService, AvailabilityLinkIssuerService],
})
export class AvailabilityLinkModule {}
