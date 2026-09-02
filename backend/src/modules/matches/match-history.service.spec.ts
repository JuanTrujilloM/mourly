import { PrismaService } from '../../config/prisma.service';
import { MatchHistoryService } from './match-history.service';

function setup(matches: unknown[] = [], feedbacks: unknown[] = []) {
  const prisma = {
    match: { findMany: jest.fn().mockResolvedValue(matches) },
    feedback: { findMany: jest.fn().mockResolvedValue(feedbacks) },
  } as unknown as PrismaService;
  return new MatchHistoryService(prisma);
}

describe('MatchHistoryService', () => {
  describe('priorPartnersByUser', () => {
    it('returns an empty map with no history', async () => {
      const service = setup();

      expect((await service.priorPartnersByUser(['u1'])).size).toBe(0);
    });

    it('links both directions of every past pair', async () => {
      const service = setup([{ userAId: 'u1', userBId: 'u2' }]);

      const partners = await service.priorPartnersByUser(['u1', 'u2']);

      expect([...(partners.get('u1') ?? [])]).toEqual(['u2']);
      expect([...(partners.get('u2') ?? [])]).toEqual(['u1']);
    });

    it('accumulates several partners per user', async () => {
      const service = setup([
        { userAId: 'u1', userBId: 'u2' },
        { userAId: 'u1', userBId: 'u3' },
      ]);

      expect((await service.priorPartnersByUser(['u1'])).get('u1')?.size).toBe(
        2,
      );
    });
  });

  describe('reliabilityByUser', () => {
    it('is empty with no feedback', async () => {
      const service = setup();

      expect((await service.reliabilityByUser(['u1'])).size).toBe(0);
    });

    it('scores a perfect attendance record as 1', async () => {
      const service = setup([], [{ userId: 'u1', occurred: true }]);

      expect((await service.reliabilityByUser(['u1'])).get('u1')).toBe(1);
    });

    it('scores a full no-show record as -1', async () => {
      const service = setup([], [{ userId: 'u1', occurred: false }]);

      expect((await service.reliabilityByUser(['u1'])).get('u1')).toBe(-1);
    });

    it('scores a mixed record between the extremes', async () => {
      const service = setup(
        [],
        [
          { userId: 'u1', occurred: true },
          { userId: 'u1', occurred: false },
        ],
      );

      expect((await service.reliabilityByUser(['u1'])).get('u1')).toBe(0);
    });
  });
});
