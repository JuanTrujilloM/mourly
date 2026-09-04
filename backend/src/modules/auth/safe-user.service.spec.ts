import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { SafeUserService } from './safe-user.service';
import { UniversitiesService } from '../universities/universities.service';

const BASE_USER = {
  id: 'u1',
  email: 'ana@eafit.edu.co',
  cellphone: '+573001112233',
  isVerified: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
  profile: { id: 'p1' },
  preferences: { id: 'pref1' },
};

function setup(user: unknown) {
  const findUnique = jest.fn().mockResolvedValue(user);
  const prisma = { user: { findUnique } } as unknown as PrismaService;
  const universities = { nameForEmail: jest.fn().mockResolvedValue('EAFIT') };
  return {
    service: new SafeUserService(
      prisma,
      universities as unknown as UniversitiesService,
    ),
    findUnique,
  };
}

describe('SafeUserService', () => {
  const originalAdmins = process.env.ADMIN_EMAILS;

  afterEach(() => {
    process.env.ADMIN_EMAILS = originalAdmins;
  });

  it('never exposes fields beyond the safe shape', async () => {
    const { service } = setup(BASE_USER);

    const safe = await service.getById('u1');

    expect(Object.keys(safe).sort()).toEqual([
      'cellphone',
      'createdAt',
      'email',
      'id',
      'isAdmin',
      'isVerified',
      'onboardingCompleted',
      'university',
      'updatedAt',
    ]);
  });

  it('marks onboarding complete only with both profile and preferences', async () => {
    const { service } = setup(BASE_USER);

    expect((await service.getById('u1')).onboardingCompleted).toBe(true);
  });

  it('marks onboarding incomplete when preferences are missing', async () => {
    const { service } = setup({ ...BASE_USER, preferences: null });

    expect((await service.getById('u1')).onboardingCompleted).toBe(false);
  });

  it('marks onboarding incomplete when the profile is missing', async () => {
    const { service } = setup({ ...BASE_USER, profile: null });

    expect((await service.getById('u1')).onboardingCompleted).toBe(false);
  });

  it('derives isAdmin from the allowlist', async () => {
    process.env.ADMIN_EMAILS = 'ana@eafit.edu.co';
    const { service } = setup(BASE_USER);

    expect((await service.getById('u1')).isAdmin).toBe(true);
  });

  it('reports a non-allowlisted user as not admin', async () => {
    process.env.ADMIN_EMAILS = 'someone.else@eafit.edu.co';
    const { service } = setup(BASE_USER);

    expect((await service.getById('u1')).isAdmin).toBe(false);
  });

  it('derives the university from the verified email', async () => {
    const { service } = setup(BASE_USER);

    expect((await service.getById('u1')).university).toBe('EAFIT');
  });

  it('rejects an unknown user id', async () => {
    const { service } = setup(null);

    await expect(service.getById('missing')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
