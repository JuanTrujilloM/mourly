import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AuthService } from './auth.service';
import { SafeUserService } from './safe-user.service';
import { SessionService } from './session.service';
import { UserLookupService } from './user-lookup.service';
import { VerificationCodeService } from './verification-code.service';
import { VerificationDeliveryService } from './verification-delivery.service';
import { NEUTRAL_MESSAGE } from './auth.messages';
import {
  INVALID_CODE_MESSAGE,
  TOO_MANY_ATTEMPTS_MESSAGE,
} from './verification-messages';

const USER = { id: 'u1', email: 'ana@eafit.edu.co' };

function setup() {
  const update = jest.fn().mockResolvedValue(USER);
  const prisma = { user: { update } } as unknown as PrismaService;

  const codes = {
    validate: jest.fn().mockResolvedValue('ok'),
    hasVerifiedEmail: jest.fn().mockResolvedValue(false),
  };
  const delivery = {
    sendIfCooldownElapsed: jest.fn().mockResolvedValue(undefined),
    sendOrThrowCooldown: jest.fn().mockResolvedValue(undefined),
  };
  const sessions = {
    issueFor: jest.fn().mockResolvedValue({ accessToken: 'a' }),
  };
  const safeUsers = { getById: jest.fn().mockResolvedValue(USER) };
  const users = { findByEmail: jest.fn().mockResolvedValue(USER) };

  const service = new AuthService(
    prisma,
    codes as unknown as VerificationCodeService,
    delivery as unknown as VerificationDeliveryService,
    sessions as unknown as SessionService,
    safeUsers as unknown as SafeUserService,
    users as unknown as UserLookupService,
  );
  return { service, codes, delivery, sessions, safeUsers, users, update };
}

describe('AuthService', () => {
  describe('login', () => {
    it('sends a code to a known account and answers neutrally', async () => {
      const { service, delivery } = setup();

      const result = await service.login({ email: 'Ana@EAFIT.edu.co' });

      expect(delivery.sendIfCooldownElapsed).toHaveBeenCalledWith(
        'u1',
        'ana@eafit.edu.co',
      );
      expect(result).toEqual({ message: NEUTRAL_MESSAGE });
    });

    it('answers the same message for an unknown account', async () => {
      const { service, users, delivery } = setup();
      users.findByEmail.mockResolvedValue(null);

      const result = await service.login({ email: 'ghost@eafit.edu.co' });

      expect(delivery.sendIfCooldownElapsed).not.toHaveBeenCalled();
      expect(result).toEqual({ message: NEUTRAL_MESSAGE });
    });
  });

  describe('verify', () => {
    it('marks the user verified and issues a session', async () => {
      const { service, update, sessions } = setup();

      await service.verify({ email: 'ana@eafit.edu.co', code: '123456' });

      expect(update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { isVerified: true },
      });
      expect(sessions.issueFor).toHaveBeenCalledWith('u1', 'ana@eafit.edu.co');
    });

    it('hides whether the email exists when it does not', async () => {
      const { service, users } = setup();
      users.findByEmail.mockResolvedValue(null);

      await expect(
        service.verify({ email: 'ghost@eafit.edu.co', code: '123456' }),
      ).rejects.toThrow(INVALID_CODE_MESSAGE);
    });

    it('reports a lockout after too many attempts', async () => {
      const { service, codes } = setup();
      codes.validate.mockResolvedValue('too_many_attempts');

      await expect(
        service.verify({ email: 'ana@eafit.edu.co', code: '000000' }),
      ).rejects.toThrow(TOO_MANY_ATTEMPTS_MESSAGE);
    });

    it('uses the same message for a wrong and an expired code', async () => {
      const wrong = setup();
      wrong.codes.validate.mockResolvedValue('mismatch');
      const expired = setup();
      expired.codes.validate.mockResolvedValue('expired');

      const attempt = (harness: ReturnType<typeof setup>) =>
        harness.service
          .verify({ email: 'ana@eafit.edu.co', code: '000000' })
          .catch((error: BadRequestException) => error.message);

      expect(await attempt(wrong)).toBe(await attempt(expired));
    });
  });

  describe('resend', () => {
    it('sends a new code for an unverified account', async () => {
      const { service, delivery } = setup();

      const result = await service.resend({ email: 'ana@eafit.edu.co' });

      expect(delivery.sendOrThrowCooldown).toHaveBeenCalledWith(
        'u1',
        'ana@eafit.edu.co',
      );
      expect(result).toEqual({ message: NEUTRAL_MESSAGE });
    });

    it('stays silent for an already verified account', async () => {
      const { service, codes, delivery } = setup();
      codes.hasVerifiedEmail.mockResolvedValue(true);

      const result = await service.resend({ email: 'ana@eafit.edu.co' });

      expect(delivery.sendOrThrowCooldown).not.toHaveBeenCalled();
      expect(result).toEqual({ message: NEUTRAL_MESSAGE });
    });

    it('stays silent for an unknown account', async () => {
      const { service, users, delivery } = setup();
      users.findByEmail.mockResolvedValue(null);

      const result = await service.resend({ email: 'ghost@eafit.edu.co' });

      expect(delivery.sendOrThrowCooldown).not.toHaveBeenCalled();
      expect(result).toEqual({ message: NEUTRAL_MESSAGE });
    });
  });

  describe('getById', () => {
    it('delegates to the safe user projection', async () => {
      const { service, safeUsers } = setup();

      expect(await service.getById('u1')).toBe(USER);
      expect(safeUsers.getById).toHaveBeenCalledWith('u1');
    });
  });
});
