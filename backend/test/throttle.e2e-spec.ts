import request from 'supertest';
import type { Server } from 'http';
import type { TestApp } from './setup-app';

process.env.THROTTLE_AUTH_LIMIT = '2';
process.env.THROTTLE_DEFAULT_LIMIT = '3';

describe('Rate limiting (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    const { createTestApp } =
      require('./setup-app') as typeof import('./setup-app');
    context = await createTestApp({ throttle: true });
    context.prisma.user.findUnique.mockResolvedValue(null);
  });

  afterAll(async () => {
    await context.close();
  });

  const server = () => context.app.getHttpServer() as Server;

  it('caps repeated credential attempts', async () => {
    const attempt = () =>
      request(server()).post('/auth/login').send({ email: 'ana@eafit.edu.co' });

    await attempt().expect(200);
    await attempt().expect(200);
    await attempt().expect(429);
  });

  it('explains the block in Spanish instead of leaking the exception name', async () => {
    const attempt = () =>
      request(server())
        .post('/auth/resend')
        .send({ email: 'ana@eafit.edu.co' });

    await attempt();
    await attempt();
    const response = await attempt().expect(429);

    expect(response.body.message).toBe(
      'Estás yendo muy rápido. Esperá un momento y volvé a intentarlo.',
    );
    expect(response.body.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('applies a looser cap to ordinary routes', async () => {
    const attempt = () => request(server()).get('/health');

    await attempt().expect(200);
    await attempt().expect(200);
    await attempt().expect(200);
    await attempt().expect(429);
  });
});
