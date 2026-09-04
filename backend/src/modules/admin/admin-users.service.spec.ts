import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AdminUsersService } from './admin-users.service';

const USER_ROW = {
  id: 'u1',
  email: 'ana@eafit.edu.co',
  cellphone: '+573001112233',
  isVerified: true,
  createdAt: new Date('2026-01-01'),
  profile: {
    name: 'Ana',
    dateOfBirth: new Date('2003-01-01'),
    gender: 'Femenino',
    university: 'EAFIT',
    major: 'Derecho',
    semester: '6',
    status: 'SEARCHING',
  },
};

function setup(users: unknown[] = [USER_ROW], matches: unknown[] = []) {
  const userFindMany = jest.fn().mockResolvedValue(users);
  const userFindUnique = jest.fn().mockResolvedValue({ id: 'u1' });
  const userUpdate = jest.fn().mockResolvedValue({});
  const matchFindMany = jest.fn().mockResolvedValue(matches);
  const profileFindUnique = jest.fn().mockResolvedValue({ id: 'p1' });
  const profileUpdate = jest.fn().mockResolvedValue({});

  const prisma = {
    user: {
      findMany: userFindMany,
      findUnique: userFindUnique,
      update: userUpdate,
    },
    match: { findMany: matchFindMany },
    profile: { findUnique: profileFindUnique, update: profileUpdate },
  } as unknown as PrismaService;

  return {
    service: new AdminUsersService(prisma),
    userFindUnique,
    userUpdate,
    profileFindUnique,
    profileUpdate,
  };
}

describe('AdminUsersService', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('listUsers', () => {
    it('counts matches on both sides of the pair', async () => {
      const { service } = setup(
        [USER_ROW],
        [
          { userAId: 'u1', userBId: 'u2' },
          { userAId: 'u3', userBId: 'u1' },
        ],
      );

      expect((await service.listUsers())[0].matchCount).toBe(2);
    });

    it('reports zero matches for a fresh user', async () => {
      const { service } = setup();

      expect((await service.listUsers())[0].matchCount).toBe(0);
    });

    it('derives the age from the birth date', async () => {
      const { service } = setup();

      expect((await service.listUsers())[0].profile?.age).toBe(23);
    });

    it('handles a user without a profile', async () => {
      const { service } = setup([{ ...USER_ROW, profile: null }]);

      expect((await service.listUsers())[0].profile).toBeNull();
    });
  });

  describe('setUserStatus', () => {
    it('rejects a user with no profile yet', async () => {
      const { service, profileFindUnique } = setup();
      profileFindUnique.mockResolvedValue(null);

      await expect(service.setUserStatus('u1', 'PAUSED')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('updates the profile status', async () => {
      const { service, profileUpdate } = setup();

      expect(await service.setUserStatus('u1', 'PAUSED')).toEqual({
        id: 'u1',
        status: 'PAUSED',
      });
      expect(profileUpdate).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        data: { status: 'PAUSED' },
      });
    });
  });

  describe('verifyUser', () => {
    it('rejects an unknown user', async () => {
      const { service, userFindUnique } = setup();
      userFindUnique.mockResolvedValue(null);

      await expect(service.verifyUser('ghost')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('flips the verified flag', async () => {
      const { service, userUpdate } = setup();

      expect(await service.verifyUser('u1')).toEqual({
        id: 'u1',
        isVerified: true,
      });
      expect(userUpdate).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { isVerified: true },
      });
    });
  });
});
