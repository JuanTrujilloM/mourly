import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma.service';
import { VerificationCodeService } from './verification-code.service';

function setup() {
  const findFirst = jest.fn().mockResolvedValue(null);
  const update = jest.fn().mockResolvedValue({});
  const prisma = {
    emailVerificationCode: { findFirst, update },
  } as unknown as PrismaService;

  const service = new VerificationCodeService(prisma);
  return { service, findFirst, update };
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
});
