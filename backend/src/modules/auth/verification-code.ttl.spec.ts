import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { VerificationCodeService } from './verification-code.service';
import { VerificationResendPolicyService } from './verification-resend-policy.service';

function ttlMinutesWith(env: Record<string, string>): number {
  const config = { get: (key: string) => env[key] } as unknown as ConfigService;
  const service = new VerificationCodeService(
    {} as PrismaService,
    config,
    {} as VerificationResendPolicyService,
  );
  return service.ttlMinutes;
}

describe('VerificationCodeService.ttlMinutes', () => {
  it('reads EMAIL_CODE_TTL_MINUTES', () => {
    expect(ttlMinutesWith({ EMAIL_CODE_TTL_MINUTES: '30' })).toBe(30);
  });

  it('defaults to ten minutes', () => {
    expect(ttlMinutesWith({})).toBe(10);
  });
});
