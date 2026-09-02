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
      service: 'theconnection-api',
      database: 'connected',
    });
    expect(new Date(status.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('reports error when the database is unreachable', async () => {
    const service = setup(jest.fn().mockRejectedValue(new Error('down')));

    expect(await service.check()).toMatchObject({
      status: 'error',
      database: 'disconnected',
    });
  });
});
