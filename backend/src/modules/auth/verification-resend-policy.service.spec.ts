import { PrismaService } from '../../config/prisma.service';
import { VerificationResendPolicyService } from './verification-resend-policy.service';

function setup() {
  const findFirst = jest.fn().mockResolvedValue(null);
  const prisma = {
    emailVerificationCode: { findFirst },
  } as unknown as PrismaService;
  return { service: new VerificationResendPolicyService(prisma), findFirst };
}

function pendingCode(overrides: Record<string, unknown> = {}) {
  return {
    id: 'code-1',
    resendCount: 0,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 600_000),
    ...overrides,
  };
}

describe('VerificationResendPolicyService', () => {
  describe('getSecondsUntilResendAllowed', () => {
    it('allows an immediate send when no code exists', async () => {
      const { service } = setup();

      expect(await service.getSecondsUntilResendAllowed('u1')).toBe(0);
    });

    it('reports the remaining cooldown for a fresh code', async () => {
      const { service, findFirst } = setup();
      findFirst.mockResolvedValue(pendingCode());

      const remaining = await service.getSecondsUntilResendAllowed('u1');

      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(60);
    });

    it('reports zero once the cooldown has passed', async () => {
      const { service, findFirst } = setup();
      findFirst.mockResolvedValue(
        pendingCode({ createdAt: new Date(Date.now() - 120_000) }),
      );

      expect(await service.getSecondsUntilResendAllowed('u1')).toBe(0);
    });
  });

  describe('hasExhaustedResends', () => {
    it('allows resends while the count is below the limit', async () => {
      const { service, findFirst } = setup();
      findFirst.mockResolvedValue(pendingCode({ resendCount: 2 }));

      expect(await service.hasExhaustedResends('u1')).toBe(false);
    });

    it('blocks the fourth code of a cycle', async () => {
      const { service, findFirst } = setup();
      findFirst.mockResolvedValue(pendingCode({ resendCount: 3 }));

      expect(await service.hasExhaustedResends('u1')).toBe(true);
    });

    it('starts a new cycle once the last code expired', async () => {
      const { service, findFirst } = setup();
      findFirst.mockResolvedValue(
        pendingCode({ resendCount: 5, expiresAt: new Date(Date.now() - 1000) }),
      );

      expect(await service.hasExhaustedResends('u1')).toBe(false);
    });
  });

  describe('nextResendCount', () => {
    it('starts at zero when no code is pending', async () => {
      const { service } = setup();

      expect(await service.nextResendCount('u1')).toBe(0);
    });

    it('counts up from the pending code', async () => {
      const { service, findFirst } = setup();
      findFirst.mockResolvedValue(pendingCode({ resendCount: 1 }));

      expect(await service.nextResendCount('u1')).toBe(2);
    });

    it('resets after the pending code expired', async () => {
      const { service, findFirst } = setup();
      findFirst.mockResolvedValue(
        pendingCode({ resendCount: 3, expiresAt: new Date(Date.now() - 1000) }),
      );

      expect(await service.nextResendCount('u1')).toBe(0);
    });
  });
});
