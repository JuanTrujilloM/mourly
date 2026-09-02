import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { VenuesModule } from '../venues/venues.module';
import { AvailabilityLinkModule } from '../availability-link/availability-link.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { VenueSelectionService } from './venue-selection.service';
import { VenueRankingService } from './venue-ranking.service';
import { MatchInviteService } from './match-invite.service';
import { MatchConfirmationService } from './match-confirmation.service';
import { MatchLoaderService } from './match-loader.service';
import { MatchReschedulerService } from './match-rescheduler.service';
import { MatchRecyclerService } from './match-recycler.service';
import { MatchResponseService } from './match-response.service';
import { MatchTimeoutService } from './match-timeout.service';
import { WeeklyMatchingService } from './weekly-matching.service';
import { CandidateLoaderService } from './candidate-loader.service';
import { MatchHistoryService } from './match-history.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    VenuesModule,
    AvailabilityLinkModule,
    NotificationsModule,
  ],
  controllers: [MatchesController],
  providers: [
    MatchesService,
    VenueSelectionService,
    VenueRankingService,
    MatchInviteService,
    MatchConfirmationService,
    MatchLoaderService,
    MatchReschedulerService,
    MatchRecyclerService,
    MatchResponseService,
    MatchTimeoutService,
    WeeklyMatchingService,
    CandidateLoaderService,
    MatchHistoryService,
  ],
  exports: [
    MatchesService,
    VenueSelectionService,
    MatchConfirmationService,
    MatchInviteService,
    MatchResponseService,
  ],
})
export class MatchesModule {}
