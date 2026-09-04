import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';

describe('Health (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  const server = () => context.app.getHttpServer() as Server;

  it('reports ok when the database answers', async () => {
    const response = await request(server()).get('/health').expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'mourly-api',
      database: 'connected',
    });
  });

  it('reports error when the database is unreachable', async () => {
    context.prisma.$queryRaw.mockRejectedValueOnce(new Error('down'));

    const response = await request(server()).get('/health').expect(200);

    expect(response.body).toMatchObject({
      status: 'error',
      database: 'disconnected',
    });
  });

  it('answers 404 for an unknown route', async () => {
    const response = await request(server()).get('/does-not-exist').expect(404);

    expect(response.body).toMatchObject({ statusCode: 404 });
  });
});
