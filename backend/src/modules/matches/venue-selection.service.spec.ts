import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { VenueRankingService } from './venue-ranking.service';
import { VenueSelectionService } from './venue-selection.service';

function venueRow(id: string, name = `Venue ${id}`) {
  return {
    id,
    name,
    type: 'Café',
    address: 'Cra 37',
    openingHours: '8-20',
    description: 'Nice',
    tags: [],
    averageSpentPerPerson: 30000,
    commissionRate: 0.1,
  };
}

function optionRow(id: string, userASelected = false, userBSelected = false) {
  return {
    venueId: id,
    userASelected,
    userBSelected,
    venue: venueRow(id),
  };
}

function setup(match: unknown = { id: 'm1', userAId: 'u1', userBId: 'u2' }) {
  const findUnique = jest.fn().mockResolvedValue(match);
  const optionFindMany = jest.fn().mockResolvedValue([]);
  const optionCreateMany = jest.fn().mockResolvedValue({ count: 3 });
  const optionUpdateMany = jest.fn().mockResolvedValue({ count: 1 });

  const prisma = {
    match: { findUnique },
    venueOption: {
      findMany: optionFindMany,
      createMany: optionCreateMany,
      updateMany: optionUpdateMany,
    },
    $transaction: (operations: Promise<unknown>[]) => Promise.all(operations),
  } as unknown as PrismaService;

  const ranking = {
    rankForPair: jest
      .fn()
      .mockResolvedValue([venueRow('v1'), venueRow('v2'), venueRow('v3')]),
  };

  const service = new VenueSelectionService(
    prisma,
    ranking as unknown as VenueRankingService,
  );
  return {
    service,
    ranking,
    optionFindMany,
    optionCreateMany,
    optionUpdateMany,
  };
}

describe('VenueSelectionService', () => {
  describe('getSuggestions', () => {
    it('rejects an unknown match', async () => {
      const { service } = setup(null);

      await expect(service.getSuggestions('ghost', 'u1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('persists three options the first time and returns them', async () => {
      const { service, optionFindMany, optionCreateMany } = setup();
      optionFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          optionRow('v1'),
          optionRow('v2'),
          optionRow('v3'),
        ]);

      const suggestions = await service.getSuggestions('m1', 'u1');

      expect(optionCreateMany.mock.calls[0][0].data).toHaveLength(3);
      expect(optionCreateMany.mock.calls[0][0].skipDuplicates).toBe(true);
      expect(suggestions).toHaveLength(3);
    });

    it('reuses the stored options on later calls', async () => {
      const { service, optionCreateMany, optionFindMany } = setup();
      optionFindMany.mockResolvedValue([optionRow('v1'), optionRow('v2')]);

      await service.getSuggestions('m1', 'u1');

      expect(optionCreateMany).not.toHaveBeenCalled();
    });

    it('refuses to suggest when there are too few active venues', async () => {
      const { service, ranking } = setup();
      ranking.rankForPair.mockResolvedValue([venueRow('v1')]);

      await expect(service.getSuggestions('m1', 'u1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('reports the selection flag of the calling user', async () => {
      const { service, optionFindMany } = setup();
      optionFindMany.mockResolvedValue([optionRow('v1', true, false)]);

      const asUserA = await service.getSuggestions('m1', 'u1');
      const asUserB = await service.getSuggestions('m1', 'u2');

      expect(asUserA[0].selected).toBe(true);
      expect(asUserB[0].selected).toBe(false);
    });

    it('never exposes the commission rate', async () => {
      const { service, optionFindMany } = setup();
      optionFindMany.mockResolvedValue([optionRow('v1')]);

      const suggestions = await service.getSuggestions('m1', 'u1');

      expect(suggestions[0]).not.toHaveProperty('commissionRate');
    });
  });

  describe('select', () => {
    it('rejects a venue that was never suggested', async () => {
      const { service, optionFindMany } = setup();
      optionFindMany.mockResolvedValue([
        { venueId: 'v1' },
        { venueId: 'v2' },
        { venueId: 'v3' },
      ]);

      await expect(service.select('m1', 'u1', ['v1', 'v9'])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects a selection when no options exist yet', async () => {
      const { service } = setup();

      await expect(service.select('m1', 'u1', ['v1'])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('flips the chosen options on and the rest off for userA', async () => {
      const { service, optionFindMany, optionUpdateMany } = setup();
      optionFindMany.mockResolvedValue([
        { venueId: 'v1' },
        { venueId: 'v2' },
        { venueId: 'v3' },
      ]);

      const result = await service.select('m1', 'u1', ['v1', 'v2']);

      expect(optionUpdateMany.mock.calls[0][0].data).toEqual({
        userASelected: true,
      });
      expect(optionUpdateMany.mock.calls[1][0].data).toEqual({
        userASelected: false,
      });
      expect(result).toEqual({ selectedVenueIds: ['v1', 'v2'] });
    });

    it('writes to the userB columns when the caller is userB', async () => {
      const { service, optionFindMany, optionUpdateMany } = setup();
      optionFindMany.mockResolvedValue([{ venueId: 'v1' }]);

      await service.select('m1', 'u2', ['v1']);

      expect(optionUpdateMany.mock.calls[0][0].data).toEqual({
        userBSelected: true,
      });
    });

    it('scopes every write to the match from the token', async () => {
      const { service, optionFindMany, optionUpdateMany } = setup();
      optionFindMany.mockResolvedValue([{ venueId: 'v1' }]);

      await service.select('m1', 'u1', ['v1']);

      expect(optionUpdateMany.mock.calls[0][0].where.matchId).toBe('m1');
    });
  });
});
