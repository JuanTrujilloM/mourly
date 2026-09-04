import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';

const VENUE_INPUT = {
  name: 'Pergamino',
  type: 'Café',
  address: 'Cra 37',
  openingHours: '8-20',
  description: 'Nice',
  commissionRate: 0.1,
  averageSpentPerPerson: 30000,
  tags: ['café'],
} as CreateVenueDto;

function setup(existing: unknown = { id: 'v1' }) {
  const findMany = jest.fn().mockResolvedValue([]);
  const findUnique = jest.fn().mockResolvedValue(existing);
  const create = jest.fn().mockResolvedValue({ id: 'v1' });
  const update = jest.fn().mockResolvedValue({ id: 'v1' });
  const prisma = {
    venue: { findMany, findUnique, create, update },
  } as unknown as PrismaService;

  return {
    service: new VenuesService(prisma),
    findMany,
    findUnique,
    create,
    update,
  };
}

describe('VenuesService', () => {
  it('lists every venue newest first', async () => {
    const { service, findMany } = setup();

    await service.findAll();

    expect(findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
  });

  it('lists only active venues for suggestions', async () => {
    const { service, findMany } = setup();

    await service.findActive();

    expect(findMany).toHaveBeenCalledWith({ where: { active: true } });
  });

  it('creates a venue active by default', async () => {
    const { service, create } = setup();

    await service.create(VENUE_INPUT);

    expect(create).toHaveBeenCalledWith({
      data: { ...VENUE_INPUT, active: true },
    });
  });

  it('respects an explicit inactive flag on create', async () => {
    const { service, create } = setup();

    await service.create({ ...VENUE_INPUT, active: false });

    expect(create.mock.calls[0][0].data.active).toBe(false);
  });

  it('updates an existing venue', async () => {
    const { service, update } = setup();

    await service.update('v1', { name: 'Nuevo' });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: { name: 'Nuevo' },
    });
  });

  it('rejects an update on a missing venue', async () => {
    const { service } = setup(null);

    await expect(service.update('ghost', { name: 'x' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deactivates instead of deleting', async () => {
    const { service, update } = setup();

    await service.deactivate('v1');

    expect(update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: { active: false },
    });
  });

  it('rejects deactivating a missing venue', async () => {
    const { service } = setup(null);

    await expect(service.deactivate('ghost')).rejects.toThrow(
      NotFoundException,
    );
  });
});
