import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma.service';
import { VerificationCodeService } from './verification-code.service';
import { VerificationResendPolicyService } from './verification-resend-policy.service';

function setup(env: Record<string, string> = {}) {
  const create = jest.fn().mockResolvedValue({ id: 'code-1' });
  const deleteMany = jest.fn().mockResolvedValue({ count: 1 });
  const findFirst = jest.fn().mockResolvedValue(null);
  const update = jest.fn().mockResolvedValue({});
  const prisma = {
    emailVerificationCode: { create, deleteMany, findFirst, update },
  } as unknown as PrismaService;

  const config = { get: (key: string) => env[key] } as unknown as ConfigService;
  const resendPolicy = {
    nextResendCount: jest.fn().mockResolvedValue(0),
  } as unknown as VerificationResendPolicyService;
  const service = new VerificationCodeService(prisma, config, resendPolicy);
  return { service, create, deleteMany, findFirst, update, resendPolicy };
}

function activeCode(overrides: Record<string, unknown> = {}) {
  return {
    id: 'code-1',
    codeHash: bcrypt.hashSync('123456', 4),
    expiresAt: new Date(Date.now() + 60_000),
    attempts: 0,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('VerificationCodeService', () => {
  describe('issueForUser', () => {
    it('drops any previous unconsumed code first', async () => {
      const { service, deleteMany } = setup();

      await service.issueForUser('u1');

      expect(deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1', consumedAt: null },
      });
    });

    it('returns a six digit code and stores only its hash', async () => {
      const { service, create } = setup();

      const code = await service.issueForUser('u1');

      expect(code).toMatch(/^\d{6}$/);
      const stored = create.mock.calls[0][0].data.codeHash as string;
      expect(stored).not.toBe(code);
      expect(bcrypt.compareSync(code, stored)).toBe(true);
    });

    it('honors a configured time to live', async () => {
      const { service, create } = setup({ EMAIL_CODE_TTL_MINUTES: '30' });
      const before = Date.now();

      await service.issueForUser('u1');

      const expiresAt = create.mock.calls[0][0].data.expiresAt as Date;
      expect(expiresAt.getTime()).toBeGreaterThan(before + 29 * 60_000);
    });
  });

  describe('validate', () => {
    it('reports not_found when no active code exists', async () => {
      const { service } = setup();

      expect(await service.validate('u1', '123456')).toBe('not_found');
    });

    it('reports expired for a stale code', async () => {
      const { service, findFirst } = setup();
      findFirst.mockResolvedValue(
        activeCode({ expiresAt: new Date(Date.now() - 1000) }),
      );

      expect(await service.validate('u1', '123456')).toBe('expired');
    });

    it('locks the code after the attempt limit', async () => {
      const { service, findFirst } = setup();
      findFirst.mockResolvedValue(activeCode({ attempts: 5 }));

      expect(await service.validate('u1', '123456')).toBe('too_many_attempts');
    });

    it('counts a wrong code as a failed attempt', async () => {
      const { service, findFirst, update } = setup();
      findFirst.mockResolvedValue(activeCode());

      expect(await service.validate('u1', '999999')).toBe('mismatch');
      expect(update).toHaveBeenCalledWith({
        where: { id: 'code-1' },
        data: { attempts: { increment: 1 } },
      });
    });

    it('consumes the code on a correct match', async () => {
      const { service, findFirst, update } = setup();
      findFirst.mockResolvedValue(activeCode());

      expect(await service.validate('u1', '123456')).toBe('ok');
      expect(update.mock.calls[0][0].data.consumedAt).toBeInstanceOf(Date);
    });
  });

  describe('hasVerifiedEmail', () => {
    it('is true once a code has been consumed', async () => {
      const { service, findFirst } = setup();
      findFirst.mockResolvedValue({ id: 'code-1' });

      expect(await service.hasVerifiedEmail('u1')).toBe(true);
    });

    it('is false when no code was ever consumed', async () => {
      const { service } = setup();

      expect(await service.hasVerifiedEmail('u1')).toBe(false);
    });
  });

  describe('issueForUser', () => {
    it('stamps the code with the resend count the policy reports', async () => {
      const { service, create, resendPolicy } = setup();
      jest.spyOn(resendPolicy, 'nextResendCount').mockResolvedValue(2);

      await service.issueForUser('u1');

      expect(create.mock.calls[0][0].data.resendCount).toBe(2);
    });
  });
});
