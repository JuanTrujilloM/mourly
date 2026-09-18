import { PrismaService } from '../../config/prisma.service';
import { UniversitiesService } from '../universities/universities.service';
import { SafeUserService } from './safe-user.service';

export const SAFE_USER_ROW = {
  id: 'u1',
  email: 'ana@eafit.edu.co',
  cellphone: '+573001112233',
  cellphoneVerifiedAt: null,
  isVerified: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
  profile: { id: 'p1' },
  preferences: { id: 'pref1' },
};

export function setupSafeUser(user: unknown) {
  const findUnique = jest.fn().mockResolvedValue(user);
  const prisma = { user: { findUnique } } as unknown as PrismaService;
  const universities = { nameForEmail: jest.fn().mockResolvedValue('EAFIT') };
  const service = new SafeUserService(
    prisma,
    universities as unknown as UniversitiesService,
  );
  return { service, findUnique };
}
