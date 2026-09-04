import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PrismaService } from '../../config/prisma.service';
import { RefreshTokenService } from './refresh-token.service';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function setup(env: Record<string, string> = {}) {
  const create = jest.fn().mockResolvedValue({ id: 'token-1' });
  const findUnique = jest.fn().mockResolvedValue(null);
  const update = jest.fn().mockResolvedValue({});
  const updateMany = jest.fn().mockResolvedValue({ count: 1 });
  const prisma = {
    refreshToken: { create, findUnique, update, updateMany },
    $transaction: (operations: Promise<unknown>[]) => Promise.all(operations),
  } as unknown as PrismaService;

  const config = { get: (key: string) => env[key] } as unknown as ConfigService;
  const service = new RefreshTokenService(prisma, config);
  return { service, create, findUnique, update, updateMany };
}

function storedToken(overrides: Record<string, unknown> = {}) {
  return {
    id: 'token-1',
    userId: 'u1',
    revokedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
    ...overrides,
  };
}

describe('RefreshTokenService', () => {
  describe('issueForUser', () => {
    it('returns a high entropy token and stores only its sha256', async () => {
      const { service, create } = setup();

      const token = await service.issueForUser('u1');

      expect(token.length).toBeGreaterThanOrEqual(43);
      expect(create.mock.calls[0][0].data.tokenHash).toBe(sha256(token));
    });

    it('honors a configured lifetime in days', async () => {
      const { service, create } = setup({ JWT_REFRESH_EXPIRES_DAYS: '2' });
      const before = Date.now();

      await service.issueForUser('u1');

      const expiresAt = create.mock.calls[0][0].data.expiresAt as Date;
      expect(expiresAt.getTime()).toBeLessThanOrEqual(
        before + 2 * 24 * 60 * 60 * 1000 + 1000,
      );
    });
  });

  describe('rotate', () => {
    it('reports an unknown token as invalid', async () => {
      const { service } = setup();

      expect(await service.rotate('nope')).toEqual({ status: 'invalid' });
    });

    it('flags a replayed revoked token as reuse', async () => {
      const { service, findUnique } = setup();
      findUnique.mockResolvedValue(storedToken({ revokedAt: new Date() }));

      expect(await service.rotate('stolen')).toEqual({
        status: 'reuse_detected',
        userId: 'u1',
      });
    });

    it('reports an expired token', async () => {
      const { service, findUnique } = setup();
      findUnique.mockResolvedValue(
        storedToken({ expiresAt: new Date(Date.now() - 1000) }),
      );

      expect(await service.rotate('old')).toEqual({ status: 'expired' });
    });

    it('revokes the old token and issues a new one atomically', async () => {
      const { service, findUnique, update, create } = setup();
      findUnique.mockResolvedValue(storedToken());

      const result = await service.rotate('current');

      expect(result.status).toBe('ok');
      expect(update).toHaveBeenCalledWith({
        where: { id: 'token-1' },
        data: { revokedAt: expect.any(Date) as Date },
      });
      if (result.status !== 'ok') throw new Error('expected rotation');
      expect(create.mock.calls[0][0].data.tokenHash).toBe(sha256(result.token));
    });
  });

  describe('revocation', () => {
    it('revokes only an active token on logout', async () => {
      const { service, updateMany } = setup();

      await service.revoke('token');

      expect(updateMany).toHaveBeenCalledWith({
        where: { tokenHash: sha256('token'), revokedAt: null },
        data: { revokedAt: expect.any(Date) as Date },
      });
    });

    it('revokes every active token for a user', async () => {
      const { service, updateMany } = setup();

      await service.revokeAllForUser('u1');

      expect(updateMany).toHaveBeenCalledWith({
        where: { userId: 'u1', revokedAt: null },
        data: { revokedAt: expect.any(Date) as Date },
      });
    });
  });
});
