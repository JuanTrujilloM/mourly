import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from '../mail/mail.module';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { SmsModule } from '../sms/sms.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PhoneCodeQuotaService } from './phone-code-quota.service';
import { PhoneNumberService } from './phone-number.service';
import { PhoneVerificationController } from './phone-verification.controller';
import { PhoneVerificationService } from './phone-verification.service';
import { SessionService } from './session.service';
import { SessionCookiesService } from './session-cookies.service';
import { SafeUserService } from './safe-user.service';
import { UnverifiedAccountCleanupService } from './unverified-account-cleanup.service';
import { UserLookupService } from './user-lookup.service';
import { VerificationDeliveryService } from './verification-delivery.service';
import { VerificationDispatcherService } from './verification-dispatcher.service';
import { verificationProviders } from './verification.providers';
import { RefreshTokenService } from './refresh-token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { IsSupportedUniversityEmailConstraint } from './validators/is-supported-university-email.validator';

@Module({
  imports: [
    PassportModule,
    MailModule,
    SmsModule,
    SchedulingModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController, PhoneVerificationController],
  providers: [
    AuthService,
    PhoneVerificationService,
    PhoneNumberService,
    PhoneCodeQuotaService,
    SessionService,
    SessionCookiesService,
    SafeUserService,
    UserLookupService,
    ...verificationProviders,
    VerificationDeliveryService,
    VerificationDispatcherService,
    UnverifiedAccountCleanupService,
    RefreshTokenService,
    JwtStrategy,
    IsSupportedUniversityEmailConstraint,
  ],
})
export class AuthModule {}
