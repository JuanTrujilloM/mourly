import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AdminMatchesService } from './admin-matches.service';

function setup(match: unknown = { id: 'm1' }) {
  const findMany = jest.fn().mockResolvedValue([]);
  const findUnique = jest.fn().mockResolvedValue(match);
  const update = jest.fn().mockResolvedValue({});

  const prisma = {
    match: { findMany, findUnique, update },
  } as unknown as PrismaService;

  return {
    service: new AdminMatchesService(prisma),
    findMany,
    findUnique,
    update,
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
