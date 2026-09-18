import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { VerificationCodeIssuerService } from './verification-code-issuer.service';

function ttlMinutesWith(env: Record<string, string>): number {
  const config = { get: (key: string) => env[key] } as unknown as ConfigService;
  return new VerificationCodeIssuerService({} as PrismaService, config)
    .ttlMinutes;
}

describe('VerificationCodeIssuerService.ttlMinutes', () => {
  it('reads EMAIL_CODE_TTL_MINUTES', () => {
    expect(ttlMinutesWith({ EMAIL_CODE_TTL_MINUTES: '30' })).toBe(30);
  });

  it('defaults to ten minutes', () => {
    expect(ttlMinutesWith({})).toBe(10);
  });
});
