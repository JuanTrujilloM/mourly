import { Module } from '@nestjs/common';
import { MatchesModule } from '../matches/matches.module';
import { AvailabilityLinkModule } from '../availability-link/availability-link.module';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { AvailabilityViewService } from './availability-view.service';
import { AvailabilityLinkResolver } from './availability-link-resolver.service';
import { MatchContextService } from './match-context.service';

@Module({
  imports: [MatchesModule, AvailabilityLinkModule],
  controllers: [AvailabilityController],
  providers: [
    AvailabilityService,
    AvailabilityViewService,
    AvailabilityLinkResolver,
    MatchContextService,
  ],
})
export class AvailabilityModule {}
