import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { PreferencesService } from './preferences.service';
import { CreatePreferencesDto } from './dto/create-preferences.dto';

const DTO = {
  relationshipType: 'Seria',
  ageRange: { min: 20, max: 28 },
  genderInterests: ['Hombres', 'No binario'],
  sameUniversity: false,
  heightRange: 'Indiferente',
  energyVibe: ['Tranquilo/a', 'Aventurero/a'],
  hobbies: ['Cine', ' Café ', 'Cine', '  '],
} as CreatePreferencesDto;

function setup(profile: unknown = { id: 'p1' }) {
  const preferencesUpsert = jest.fn().mockResolvedValue({});
  const findUniqueOrThrow = jest.fn().mockResolvedValue({ id: 'pref1' });
  const profileHobbyDeleteMany = jest.fn().mockResolvedValue({ count: 0 });
  const profileHobbyCreate = jest.fn().mockResolvedValue({});
  const hobbyUpsert = jest
    .fn()
    .mockImplementation(({ where }: { where: { name: string } }) =>
      Promise.resolve({ id: `hobby-${where.name}` }),
    );

  const tx = {
    preferences: { upsert: preferencesUpsert, findUniqueOrThrow },
    profileHobby: {
      deleteMany: profileHobbyDeleteMany,
      create: profileHobbyCreate,
    },
    hobby: { upsert: hobbyUpsert },
  };

  const preferencesFindUnique = jest.fn().mockResolvedValue(null);
  const profileFindUnique = jest.fn().mockResolvedValue(profile);
  const prisma = {
    preferences: { findUnique: preferencesFindUnique },
    profile: { findUnique: profileFindUnique },
    $transaction: (callback: (client: typeof tx) => Promise<unknown>) =>
      callback(tx),
  } as unknown as PrismaService;

  return {
    service: new PreferencesService(prisma),
    preferencesUpsert,
    preferencesFindUnique,
    profileFindUnique,
    profileHobbyCreate,
    hobbyUpsert,
  };
}

describe('PreferencesService', () => {
  describe('getByUserId', () => {
    it('returns null when the user has no preferences', async () => {
      const { service } = setup();

      expect(await service.getByUserId('u1')).toBeNull();
    });

    it('flattens the hobby names alongside the preferences', async () => {
      const { service, preferencesFindUnique, profileFindUnique } = setup();
      preferencesFindUnique.mockResolvedValue({ id: 'pref1', minAge: 20 });
      profileFindUnique.mockResolvedValue({
        hobbies: [{ hobby: { name: 'Cine' } }, { hobby: { name: 'Café' } }],
      });

      expect(await service.getByUserId('u1')).toEqual({
        id: 'pref1',
        minAge: 20,
        hobbies: ['Cine', 'Café'],
      });
    });

    it('falls back to an empty hobby list without a profile', async () => {
      const { service, preferencesFindUnique, profileFindUnique } = setup();
      preferencesFindUnique.mockResolvedValue({ id: 'pref1' });
      profileFindUnique.mockResolvedValue(null);

      expect(await service.getByUserId('u1')).toMatchObject({ hobbies: [] });
    });
  });

  describe('save', () => {
    it('requires a profile first', async () => {
      const { service } = setup(null);

      await expect(service.save('u1', DTO)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects an inverted age range', async () => {
      const { service } = setup();

      await expect(
        service.save('u1', { ...DTO, ageRange: { min: 30, max: 25 } }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects an age range with equal bounds', async () => {
      const { service } = setup();

      await expect(
        service.save('u1', { ...DTO, ageRange: { min: 25, max: 25 } }),
      ).rejects.toThrow(BadRequestException);
    });

    it('stores the vibe list as a comma separated string', async () => {
      const { service, preferencesUpsert } = setup();

      await service.save('u1', DTO);

      expect(preferencesUpsert.mock.calls[0][0].update.energyVibe).toBe(
        'Tranquilo/a, Aventurero/a',
      );
    });

    it('stores every selected gender interest and nothing about orientation', async () => {
      const { service, preferencesUpsert } = setup();

      await service.save('u1', DTO);

      const stored = preferencesUpsert.mock.calls[0][0].update;
      expect(stored.genderInterests).toEqual(['Hombres', 'No binario']);
      expect(stored).not.toHaveProperty('orientation');
    });

    it('maps the age range onto the stored columns', async () => {
      const { service, preferencesUpsert } = setup();

      await service.save('u1', DTO);

      expect(preferencesUpsert.mock.calls[0][0].update).toMatchObject({
        minAge: 20,
        maxAge: 28,
      });
    });

    it('trims, deduplicates and drops blank hobbies', async () => {
      const { service, hobbyUpsert, profileHobbyCreate } = setup();

      await service.save('u1', DTO);

      const names = hobbyUpsert.mock.calls.map(
        (call: [{ where: { name: string } }]) => call[0].where.name,
      );
      expect(names).toEqual(['Cine', 'Café']);
      expect(profileHobbyCreate).toHaveBeenCalledTimes(2);
    });
  });
});
