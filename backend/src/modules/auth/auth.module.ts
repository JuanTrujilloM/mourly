import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from '../mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegistrationService } from './registration.service';
import { SessionService } from './session.service';
import { SessionCookiesService } from './session-cookies.service';
import { SafeUserService } from './safe-user.service';
import { UserLookupService } from './user-lookup.service';
import { VerificationCodeService } from './verification-code.service';
import { VerificationDeliveryService } from './verification-delivery.service';
import { RefreshTokenService } from './refresh-token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { IsSupportedUniversityEmailConstraint } from './validators/is-supported-university-email.validator';

@Module({
  imports: [
    PassportModule,
    MailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RegistrationService,
    SessionService,
    SessionCookiesService,
    SafeUserService,
    UserLookupService,
    VerificationCodeService,
    VerificationDeliveryService,
    RefreshTokenService,
    JwtStrategy,
    IsSupportedUniversityEmailConstraint,
  ],
})
export class AuthModule {}
