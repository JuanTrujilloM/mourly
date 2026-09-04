import { PrismaService } from '../../config/prisma.service';
import { MatchLoaderService } from './match-loader.service';

function setup() {
  const findUnique = jest.fn().mockResolvedValue(null);
  const findMany = jest.fn().mockResolvedValue([]);
  const prisma = {
    match: { findUnique, findMany },
  } as unknown as PrismaService;
  return { service: new MatchLoaderService(prisma), findUnique, findMany };
}

describe('MatchLoaderService', () => {
  it('loads one match by id with the shared selection', async () => {
    const { service, findUnique } = setup();

    await service.loadById('m1');

    const args = findUnique.mock.calls[0][0] as {
      where: { id: string };
      select: Record<string, unknown>;
    };
    expect(args.where).toEqual({ id: 'm1' });
    expect(args.select).toHaveProperty('availabilities');
    expect(args.select).toHaveProperty('venueOptions');
  });

  it('loads every overdue match in a single query', async () => {
    const { service, findMany } = setup();
    const now = new Date('2026-07-10T00:00:00Z');

    await service.loadOverdue(now);

    const where = findMany.mock.calls[0][0].where as Record<string, unknown>;
    expect(where.status).toEqual({ in: ['pending', 'confirmed'] });
    expect(where.date).toEqual({ is: null });
    expect(where.scheduleDeadline).toEqual({ lt: now });
  });

  it('uses the same selection for both queries', async () => {
    const { service, findUnique, findMany } = setup();

    await service.loadById('m1');
    await service.loadOverdue(new Date());

    expect(findMany.mock.calls[0][0].select).toEqual(
      findUnique.mock.calls[0][0].select,
    );
  });
});
