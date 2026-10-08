import { ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { HealthService } from './health.service';

function setup(queryRaw: jest.Mock) {
  const prisma = { $queryRaw: queryRaw } as unknown as PrismaService;
  return new HealthService(prisma);
}

describe('HealthService', () => {
  it('reports ok when the database answers', async () => {
    const service = setup(jest.fn().mockResolvedValue([{ '?column?': 1 }]));

    const status = await service.check();

    expect(status).toMatchObject({
      status: 'ok',
      service: 'mourly-api',
      database: 'connected',
    });
    expect(new Date(status.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('fails when the database is unreachable, so a broken release never passes the healthcheck', async () => {
    const service = setup(jest.fn().mockRejectedValue(new Error('down')));

    await expect(service.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
