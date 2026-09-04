import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './config/prisma.module';
import { validateEnv } from './config/env.validation';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { CsrfOriginGuard } from './common/security/csrf-origin.guard';
import {
  THROTTLE_DEFAULT_LIMIT,
  THROTTLE_WINDOW_MS,
} from './common/constants/throttle';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { VenuesModule } from './modules/venues/venues.module';
import { MatchesModule } from './modules/matches/matches.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { AdminModule } from './modules/admin/admin.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { UniversitiesModule } from './modules/universities/universities.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { ReportsModule } from './modules/reports/reports.module';
import { HobbiesModule } from './modules/hobbies/hobbies.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([
      { ttl: THROTTLE_WINDOW_MS, limit: THROTTLE_DEFAULT_LIMIT },
    ]),
    PrismaModule,
    UniversitiesModule,
    HealthModule,
    AuthModule,
    ProfileModule,
    PreferencesModule,
    VenuesModule,
    MatchesModule,
    AvailabilityModule,
    ChatbotModule,
    AdminModule,
    CatalogModule,
    FeedbackModule,
    ReportsModule,
    HobbiesModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: CsrfOriginGuard },
  ],
})
export class AppModule {}
