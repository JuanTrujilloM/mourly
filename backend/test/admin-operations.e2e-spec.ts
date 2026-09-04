import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';

const ADMIN_ROUTES = ['/admin/hobbies', '/admin/stats'];

describe('Admin operations (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.hobby.findMany.mockResolvedValue([]);
    context.prisma.hobby.findUnique.mockResolvedValue(null);
    context.prisma.profile.groupBy = jest.fn().mockResolvedValue([]);
    context.prisma.match.groupBy = jest.fn().mockResolvedValue([]);
    context.prisma.date.groupBy = jest.fn().mockResolvedValue([]);
  });

  const server = () => context.app.getHttpServer() as Server;
  const asAdmin = () => context.accessCookie('u9', 'admin@eafit.edu.co');

  it.each(ADMIN_ROUTES)('rejects an anonymous request to %s', async (route) => {
    await request(server()).get(route).expect(401);
  });

  it.each(ADMIN_ROUTES)('rejects a non-admin session on %s', async (route) => {
    const cookie = await context.accessCookie('u1', 'student@eafit.edu.co');

    await request(server()).get(route).set('Cookie', cookie).expect(403);
  });

  describe('hobbies', () => {
    it('lists hobbies with their usage count', async () => {
      context.prisma.hobby.findMany.mockResolvedValue([
        {
          id: 'h1',
          name: 'Cine',
          category: 'Cultura',
          _count: { profiles: 7 },
        },
      ]);

      const response = await request(server())
        .get('/admin/hobbies')
        .set('Cookie', await asAdmin())
        .expect(200);

      expect(response.body[0]).toEqual({
        id: 'h1',
        name: 'Cine',
        category: 'Cultura',
        profileCount: 7,
      });
    });

    it('trims the name on create', async () => {
      context.prisma.hobby.create.mockResolvedValue({ id: 'h2' });

      await request(server())
        .post('/admin/hobbies')
        .set('Cookie', await asAdmin())
        .send({ name: '  Escalada  ' })
        .expect(201);

      expect(context.prisma.hobby.create.mock.calls[0][0].data.name).toBe(
        'Escalada',
      );
    });

    it('rejects a blank name', async () => {
      await request(server())
        .post('/admin/hobbies')
        .set('Cookie', await asAdmin())
        .send({ name: '   ' })
        .expect(400);
    });

    it('answers 409 for a duplicate hobby', async () => {
      context.prisma.hobby.findUnique.mockResolvedValue({ id: 'h1' });

      await request(server())
        .post('/admin/hobbies')
        .set('Cookie', await asAdmin())
        .send({ name: 'Cine' })
        .expect(409);
    });

    it('refuses to delete a hobby still in use', async () => {
      context.prisma.hobby.findUnique.mockResolvedValue({ id: 'h1' });
      context.prisma.profileHobby.count.mockResolvedValue(3);

      await request(server())
        .delete('/admin/hobbies/h1')
        .set('Cookie', await asAdmin())
        .expect(409);
    });
  });

  describe('stats', () => {
    it('serves the operating numbers', async () => {
      const response = await request(server())
        .get('/admin/stats')
        .set('Cookie', await asAdmin())
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('matches');
      expect(response.body).toHaveProperty('dates');
    });
  });

  describe('matching run', () => {
    it('rejects an anonymous request', async () => {
      await request(server()).post('/admin/matching/run').expect(401);
    });

    it('runs the matcher and reports what it created', async () => {
      const response = await request(server())
        .post('/admin/matching/run')
        .set('Cookie', await asAdmin())
        .expect(200);

      expect(response.body).toEqual({ created: 0, pairs: [] });
    });
  });
});
