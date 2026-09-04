import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AdminMatchesService } from './admin-matches.service';

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
    photos: [{ url: 'https://cdn/a.jpg', isPrimary: true }],
    hobbies: [{ hobby: { name: 'Cine' } }],
  },
  preferences: {
    relationshipType: 'Seria',
    orientation: 'Heterosexual',
    minAge: 20,
    maxAge: 28,
    genderInterest: 'Hombres',
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
  const findMany = jest.fn().mockResolvedValue([]);
  const findUnique = jest.fn().mockResolvedValue(match);
  const update = jest.fn().mockResolvedValue({});
  const feedbackFindMany = jest.fn().mockResolvedValue(feedback);

  const prisma = {
    match: { findMany, findUnique, update },
    feedback: { findMany: feedbackFindMany },
  } as unknown as PrismaService;

  return {
    service: new AdminMatchesService(prisma),
    findMany,
    findUnique,
    update,
    feedbackFindMany,
  };
}

describe('AdminMatchesService', () => {
  describe('listMatches', () => {
    it('summarizes both users and the scheduled date', async () => {
      const { service, findMany } = setup();
      findMany.mockResolvedValue([
        {
          id: 'm1',
          status: 'confirmed',
          compatibilityScore: 9.1,
          createdAt: new Date('2026-07-08'),
          userA: {
            id: 'u1',
            email: 'a@eafit.edu.co',
            profile: { name: 'Ana', university: 'EAFIT' },
          },
          userB: {
            id: 'u2',
            email: 'b@ces.edu.co',
            profile: { name: 'Beto', university: 'CES' },
          },
          date: {
            scheduledAt: new Date('2026-07-12'),
            status: 'accepted',
            venue: { name: 'Pergamino' },
          },
        },
      ]);

      const [row] = await service.listMatches();

      expect(row.userA.name).toBe('Ana');
      expect(row.date?.venueName).toBe('Pergamino');
    });

    it('reports a null date for an unscheduled match', async () => {
      const { service, findMany } = setup();
      findMany.mockResolvedValue([
        {
          id: 'm1',
          status: 'pending',
          compatibilityScore: 7,
          createdAt: new Date(),
          userA: { id: 'u1', email: 'a@x.co', profile: null },
          userB: { id: 'u2', email: 'b@x.co', profile: null },
          date: null,
        },
      ]);

      expect((await service.listMatches())[0].date).toBeNull();
    });
  });

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

  describe('cancelMatch', () => {
    it('rejects an unknown match', async () => {
      const { service, findUnique } = setup();
      findUnique.mockResolvedValue(null);

      await expect(service.cancelMatch('ghost')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('marks the match canceled', async () => {
      const { service, update } = setup();

      expect(await service.cancelMatch('m1')).toEqual({
        id: 'm1',
        status: 'canceled',
      });
      expect(update).toHaveBeenCalledWith({
        where: { id: 'm1' },
        data: { status: 'canceled' },
      });
    });
  });
});
