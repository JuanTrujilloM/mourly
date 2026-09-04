import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../config/prisma.service';
import { RefreshTokenService } from './refresh-token.service';
import { SafeUserService } from './safe-user.service';
import { SessionService } from './session.service';

const SAFE_USER = { id: 'u1', email: 'ana@eafit.edu.co' };

function setup() {
  const findUnique = jest
    .fn()
    .mockResolvedValue({ id: 'u1', email: 'ana@eafit.edu.co' });
  const prisma = { user: { findUnique } } as unknown as PrismaService;

  const refreshTokens = {
    issueForUser: jest.fn().mockResolvedValue('fresh-refresh'),
    rotate: jest.fn(),
    revoke: jest.fn().mockResolvedValue(undefined),
    revokeAllForUser: jest.fn().mockResolvedValue(undefined),
  };
  const safeUsers = { getById: jest.fn().mockResolvedValue(SAFE_USER) };
  const jwt = { signAsync: jest.fn().mockResolvedValue('signed-access') };

  const service = new SessionService(
    prisma,
    refreshTokens as unknown as RefreshTokenService,
    safeUsers as unknown as SafeUserService,
    jwt as unknown as JwtService,
  );
  return { service, refreshTokens, safeUsers, jwt, findUnique };
}

describe('SessionService', () => {
  describe('issueFor', () => {
    it('returns an access token, a refresh token and the safe user', async () => {
      const { service, jwt } = setup();

      const session = await service.issueFor('u1', 'ana@eafit.edu.co');

      expect(session).toEqual({
        accessToken: 'signed-access',
        refreshToken: 'fresh-refresh',
        user: SAFE_USER,
      });
      expect(jwt.signAsync).toHaveBeenCalledWith(
        { sub: 'u1', email: 'ana@eafit.edu.co' },
        { expiresIn: '15m' },
      );
    });
  });

  describe('refresh', () => {
    it('rejects a missing refresh token', async () => {
      const { service } = setup();

      await expect(service.refresh(undefined)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rotates a valid token into a new session', async () => {
      const { service, refreshTokens } = setup();
      refreshTokens.rotate.mockResolvedValue({
        status: 'ok',
        userId: 'u1',
        token: 'rotated',
      });

      const session = await service.refresh('presented');

      expect(session.refreshToken).toBe('rotated');
      expect(session.accessToken).toBe('signed-access');
    });

    it('revokes the whole family when a used token is replayed', async () => {
      const { service, refreshTokens } = setup();
      refreshTokens.rotate.mockResolvedValue({
        status: 'reuse_detected',
        userId: 'u1',
      });

      await expect(service.refresh('stolen')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(refreshTokens.revokeAllForUser).toHaveBeenCalledWith('u1');
    });

    it('rejects an expired token without revoking the family', async () => {
      const { service, refreshTokens } = setup();
      refreshTokens.rotate.mockResolvedValue({ status: 'expired' });

      await expect(service.refresh('old')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(refreshTokens.revokeAllForUser).not.toHaveBeenCalled();
    });

    it('rejects an unknown token', async () => {
      const { service, refreshTokens } = setup();
      refreshTokens.rotate.mockResolvedValue({ status: 'invalid' });

      await expect(service.refresh('nonsense')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects when the rotated token points at a deleted user', async () => {
      const { service, refreshTokens, findUnique } = setup();
      refreshTokens.rotate.mockResolvedValue({
        status: 'ok',
        userId: 'ghost',
        token: 'rotated',
      });
      findUnique.mockResolvedValue(null);

      await expect(service.refresh('presented')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('revokes the presented token', async () => {
      const { service, refreshTokens } = setup();

      await service.logout('token');

      expect(refreshTokens.revoke).toHaveBeenCalledWith('token');
    });

    it('is a no-op when no token was sent', async () => {
      const { service, refreshTokens } = setup();

      await service.logout(undefined);

      expect(refreshTokens.revoke).not.toHaveBeenCalled();
    });
  });
});
