import { PrismaService } from '../../config/prisma.service';
import { VenuesService } from '../venues/venues.service';
import { VenueRankingService } from './venue-ranking.service';

function venue(id: string, tags: string[], spend: number, name = `V${id}`) {
  return { id, name, tags, averageSpentPerPerson: spend };
}

function setup(venues: unknown[], hobbiesByUser: Record<string, string[]>) {
  const profileFindUnique = jest
    .fn()
    .mockImplementation(({ where }: { where: { userId: string } }) =>
      Promise.resolve({
        hobbies: (hobbiesByUser[where.userId] ?? []).map((name) => ({
          hobby: { name },
        })),
      }),
    );
  const prisma = {
    profile: { findUnique: profileFindUnique },
  } as unknown as PrismaService;
  const venuesService = {
    findActive: jest.fn().mockResolvedValue(venues),
  } as unknown as VenuesService;

  return new VenueRankingService(prisma, venuesService);
}

describe('VenueRankingService', () => {
  it('ranks venues matching shared hobbies first', async () => {
    const service = setup([venue('a', [], 10), venue('b', ['cine'], 50)], {
      u1: ['Cine'],
      u2: ['Cine'],
    });

    const ranked = await service.rankForPair('u1', 'u2');

    expect(ranked[0].id).toBe('b');
  });

  it('ignores hobbies only one user has', async () => {
    const service = setup([venue('a', [], 50), venue('b', ['cine'], 10)], {
      u1: ['Cine'],
      u2: ['Café'],
    });

    const ranked = await service.rankForPair('u1', 'u2');

    expect(ranked[0].id).toBe('b');
  });

  it('breaks a tie with the cheaper venue', async () => {
    const service = setup([venue('a', [], 50), venue('b', [], 10)], {});

    expect((await service.rankForPair('u1', 'u2'))[0].id).toBe('b');
  });

  it('breaks a full tie by name so the order is stable', async () => {
    const service = setup(
      [venue('a', [], 10, 'Zeta'), venue('b', [], 10, 'Alfa')],
      {},
    );

    expect((await service.rankForPair('u1', 'u2'))[0].name).toBe('Alfa');
  });

  it('matches tags case insensitively', async () => {
    const service = setup([venue('a', ['CINE'], 10)], {
      u1: ['Cine'],
      u2: ['cine'],
    });

    expect(await service.rankForPair('u1', 'u2')).toHaveLength(1);
  });

  it('treats a missing profile as having no hobbies', async () => {
    const prisma = {
      profile: { findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;
    const venuesService = {
      findActive: jest.fn().mockResolvedValue([venue('a', ['cine'], 10)]),
    } as unknown as VenuesService;
    const service = new VenueRankingService(prisma, venuesService);

    expect(await service.rankForPair('u1', 'u2')).toHaveLength(1);
  });
});
