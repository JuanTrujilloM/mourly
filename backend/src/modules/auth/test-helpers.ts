import { PrismaService } from '../../config/prisma.service';
import type { SmsSender } from '../sms/sms-sender';
import { AuthService } from './auth.service';
import { PhoneVerificationService } from './phone-verification.service';
import { SafeUserService } from './safe-user.service';
import { SessionService } from './session.service';
import { UserLookupService } from './user-lookup.service';
import { PhoneCodeQuotaService } from './phone-code-quota.service';
import { VerificationCodeIssuerService } from './verification-code-issuer.service';
import { VerificationCodeService } from './verification-code.service';
import { VerificationDispatcherService } from './verification-dispatcher.service';

export const AUTH_USER = { id: 'u1', email: 'ana@eafit.edu.co' };

export function setupAuthService() {
  const update = jest.fn().mockResolvedValue(AUTH_USER);
  const upsert = jest.fn().mockResolvedValue(AUTH_USER);
  const prisma = { user: { update, upsert } } as unknown as PrismaService;
  const codes = { validate: jest.fn().mockResolvedValue('ok') };
  const dispatcher = { dispatch: jest.fn() };
  const sessions = {
    issueFor: jest.fn().mockResolvedValue({ accessToken: 'a' }),
  };
  const safeUsers = { getById: jest.fn().mockResolvedValue(AUTH_USER) };
  const users = { findByEmail: jest.fn().mockResolvedValue(AUTH_USER) };
  const service = new AuthService(
    prisma,
    codes as unknown as VerificationCodeService,
    dispatcher as unknown as VerificationDispatcherService,
    sessions as unknown as SessionService,
    safeUsers as unknown as SafeUserService,
    users as unknown as UserLookupService,
  );
  return {
    service,
    codes,
    dispatcher,
    sessions,
    safeUsers,
    users,
    update,
    upsert,
  };
}

export function setupPhoneVerification(
  user: Record<string, unknown> | null = {
    cellphone: '+573001112233',
    cellphoneVerifiedAt: null,
  },
) {
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(user),
      update: jest.fn().mockResolvedValue({}),
    },
  };
  const quota = { hasRemaining: jest.fn().mockResolvedValue(true) };
  const issuer = {
    issueIfAllowed: jest.fn().mockResolvedValue('482913'),
    ttlMinutes: 10,
  };
  const codes = { validate: jest.fn().mockResolvedValue('ok') };
  const sms: SmsSender = { send: jest.fn().mockResolvedValue(undefined) };
  const safeUsers = {
    getById: jest.fn().mockResolvedValue({ id: 'u1', cellphoneVerified: true }),
  };
  const service = new PhoneVerificationService(
    prisma as unknown as PrismaService,
    quota as unknown as PhoneCodeQuotaService,
    issuer as unknown as VerificationCodeIssuerService,
    codes as unknown as VerificationCodeService,
    sms,
    safeUsers as unknown as SafeUserService,
  );
  return { service, prisma, quota, issuer, codes, sms, safeUsers };
}
