import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  it('delegates to the health service', async () => {
    const status = {
      status: 'ok' as const,
      service: 'mourly-api',
      timestamp: '2026-01-01T00:00:00.000Z',
      database: 'connected' as const,
    };
    const service = { check: jest.fn().mockResolvedValue(status) };

    const controller = new HealthController(
      service as unknown as HealthService,
    );

    expect(await controller.check()).toBe(status);
  });
});
