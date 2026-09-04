import request from 'supertest';
import type { Server } from 'http';
import { Prisma } from '../src/generated/prisma/client';
import { createTestApp, type TestApp } from './setup-app';

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
    context.prisma.user.findUnique.mockResolvedValue(null);
  });

  const server = () => context.app.getHttpServer() as Server;

  describe('cross origin requests', () => {
    it('rejects a mutating request from a foreign origin', async () => {
      await request(server())
        .post('/auth/login')
        .set('Origin', 'https://evil.example')
        .send({ email: 'ana@eafit.edu.co' })
        .expect(403);
    });

    it('accepts a mutating request from the configured frontend', async () => {
      await request(server())
        .post('/auth/login')
        .set('Origin', 'http://localhost:3000')
        .send({ email: 'ana@eafit.edu.co' })
        .expect(200);
    });

    it('does not block reads from a foreign origin', async () => {
      await request(server())
        .get('/health')
        .set('Origin', 'https://evil.example')
        .expect(200);
    });
  });

  describe('error responses', () => {
    it('turns a unique constraint violation into a 409', async () => {
      context.prisma.user.findUnique.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: '7.8.0',
        }),
      );

      const response = await request(server())
        .post('/auth/login')
        .send({ email: 'ana@eafit.edu.co' })
        .expect(409);

      expect(response.body).toEqual({
        statusCode: 409,
        message: 'That value is already in use.',
      });
    });

    it('never leaks an internal error message', async () => {
      context.prisma.user.findUnique.mockRejectedValue(
        new Error('postgresql://user:password@host/db is unreachable'),
      );

      const response = await request(server())
        .post('/auth/login')
        .send({ email: 'ana@eafit.edu.co' })
        .expect(500);

      expect(response.body).toEqual({
        statusCode: 500,
        message: 'Something went wrong. Please try again.',
      });
      expect(JSON.stringify(response.body)).not.toContain('password');
    });

    it('reports validation problems as a message list', async () => {
      const response = await request(server())
        .post('/auth/register')
        .send({ email: 'nope', cellphone: 'nope' })
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
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
