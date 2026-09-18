import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';

const EMAIL = 'ana@eafit.edu.co';

describe('Security (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.user.upsert.mockResolvedValue({ id: 'u1', email: EMAIL });
  });

  const server = () => context.app.getHttpServer() as Server;

  describe('cross origin requests', () => {
    it('rejects a mutating request from a foreign origin', async () => {
      await request(server())
        .post('/auth/request-code')
        .set('Origin', 'https://evil.example')
        .send({ email: EMAIL })
        .expect(403);

      expect(context.prisma.user.upsert).not.toHaveBeenCalled();
    });

    it('accepts a mutating request from the configured frontend', async () => {
      await request(server())
        .post('/auth/request-code')
        .set('Origin', 'http://localhost:3000')
        .send({ email: EMAIL })
        .expect(200);
    });

    it('does not block reads from a foreign origin', async () => {
      await request(server())
        .get('/health')
        .set('Origin', 'https://evil.example')
        .expect(200);
    });
  });

  describe('protected routes', () => {
    it.each([
      ['get', '/profile/me'],
      ['get', '/preferences/me'],
      ['get', '/matches/current'],
    ])('rejects an anonymous %s %s', async (method, route) => {
      const call = request(server())[method as 'get'](route);

      await call.expect(401);
    });

    it('rejects a profile upload without a session', async () => {
      await request(server()).post('/profile').expect(401);
    });
  });
});
