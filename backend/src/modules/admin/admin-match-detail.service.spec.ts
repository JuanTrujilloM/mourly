import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { setupPhotoUrlService } from '../storage/storage.test-helpers';
import { AdminMatchDetailService } from './admin-match-detail.service';

const DETAIL_USER = {
  id: 'u1',
  email: 'ana@eafit.edu.co',
  isVerified: true,
  profile: {
    name: 'Ana',
    dateOfBirth: new Date('2003-01-01'),
    gender: 'Femenino',
    height: 166,
    biography: 'Cine',
    university: 'EAFIT',
    major: 'Derecho',
    semester: '6',
    status: 'SEARCHING',
    photos: [
      { key: 'profiles/a.jpg', isPrimary: false },
      { key: 'profiles/b.jpg', isPrimary: true },
    ],
    hobbies: [{ hobby: { name: 'Cine' } }],
  },
  preferences: {
    relationshipType: 'Seria',
    minAge: 20,
    maxAge: 28,
    genderInterests: ['Hombres'],
    sameUniversity: false,
    heightRange: 'Indiferente',
    energyVibe: 'Tranquila',
  },
};

const DETAIL_MATCH = {
  id: 'm1',
  status: 'confirmed',
  compatibilityScore: 9.1,
  createdAt: new Date('2026-07-08'),
  updatedAt: new Date('2026-07-09'),
  userAId: 'u1',
  userBId: 'u2',
  userA: DETAIL_USER,
  userB: { ...DETAIL_USER, id: 'u2', email: 'b@ces.edu.co' },
  date: {
    id: 'd1',
    scheduledAt: new Date('2026-07-12'),
    status: 'accepted',
    venue: { name: 'Pergamino', address: 'Cra 37' },
  },
  venueOptions: [
    {
      venue: { name: 'Pergamino', type: 'Café' },
      userASelected: true,
      userBSelected: true,
    },
  ],
  availabilities: [
    { userId: 'u1', date: new Date('2026-07-12'), timeSlot: '15:00' },
    { userId: 'u2', date: new Date('2026-07-12'), timeSlot: '15:00' },
  ],
};

function setup(match: unknown = DETAIL_MATCH, feedback: unknown[] = []) {
  const findUnique = jest.fn().mockResolvedValue(match);
  const feedbackFindMany = jest.fn().mockResolvedValue(feedback);

  const prisma = {
    match: { findUnique },
    feedback: { findMany: feedbackFindMany },
  } as unknown as PrismaService;

  return {
    service: new AdminMatchDetailService(
      prisma,
      setupPhotoUrlService().photoUrls,
    ),
    findUnique,
    feedbackFindMany,
  };
}

describe('AdminMatchDetailService', () => {
  describe('getMatchDetail', () => {
    it('rejects an unknown match', async () => {
      const { service, findUnique } = setup(null);
      findUnique.mockResolvedValue(null);

      await expect(service.getMatchDetail('ghost')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('computes the hobbies both users share', async () => {
      const { service } = setup();

      expect((await service.getMatchDetail('m1')).sharedHobbies).toEqual([
        'Cine',
      ]);
    });

    it('splits availability per user', async () => {
      const { service } = setup();

      const detail = await service.getMatchDetail('m1');

      expect(detail.availability.userA).toHaveLength(1);
      expect(detail.availability.userB).toHaveLength(1);
    });

    it('loads feedback only when a date exists', async () => {
      const { service, feedbackFindMany } = setup({
        ...DETAIL_MATCH,
        date: null,
      });

      const detail = await service.getMatchDetail('m1');

      expect(detail.feedback).toEqual([]);
      expect(feedbackFindMany).not.toHaveBeenCalled();
    });

    it('flattens the feedback author name', async () => {
      const { service } = setup(DETAIL_MATCH, [
        {
          occurred: true,
          rating: 5,
          comments: 'Genial',
          noShowReason: null,
          amountSpent: 40000,
          user: { email: 'ana@eafit.edu.co', profile: { name: 'Ana' } },
        },
      ]);

      expect((await service.getMatchDetail('m1')).feedback[0].userName).toBe(
        'Ana',
      );
    });
  });
});
