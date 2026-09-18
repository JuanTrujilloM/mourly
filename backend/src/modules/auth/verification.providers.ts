import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { emailVerificationCodeTable } from './email-verification-code.table';
import { phoneVerificationCodeTable } from './phone-verification-code.table';
import { VerificationCodeIssuerService } from './verification-code-issuer.service';
import type { VerificationCodeTable } from './verification-code-table';
import { VerificationCodeService } from './verification-code.service';
import { parseTtlMinutes } from './verification-ttl';
import {
  EMAIL_CODE_ISSUER,
  EMAIL_CODE_VALIDATOR,
  PHONE_CODE_ISSUER,
  PHONE_CODE_VALIDATOR,
} from './verification.tokens';

function issuerProvider(
  token: symbol,
  table: VerificationCodeTable,
  ttlKey: string,
): Provider {
  return {
    provide: token,
    inject: [PrismaService, ConfigService],
    useFactory: (prisma: PrismaService, config: ConfigService) =>
      new VerificationCodeIssuerService(
        prisma,
        table,
        parseTtlMinutes(config.get<string>(ttlKey)),
      ),
  };
}

function validatorProvider(
  token: symbol,
  table: VerificationCodeTable,
): Provider {
  return {
    provide: token,
    inject: [PrismaService],
    useFactory: (prisma: PrismaService) =>
      new VerificationCodeService(prisma, table),
  };
}

export const verificationProviders: Provider[] = [
  issuerProvider(
    EMAIL_CODE_ISSUER,
    emailVerificationCodeTable,
    'EMAIL_CODE_TTL_MINUTES',
  ),
  validatorProvider(EMAIL_CODE_VALIDATOR, emailVerificationCodeTable),
  issuerProvider(
    PHONE_CODE_ISSUER,
    phoneVerificationCodeTable,
    'PHONE_CODE_TTL_MINUTES',
  ),
  validatorProvider(PHONE_CODE_VALIDATOR, phoneVerificationCodeTable),
];
