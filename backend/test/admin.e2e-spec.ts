import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';

const ADMIN_ROUTES = [
  '/admin/users',
  '/admin/matches',
  '/admin/feedback',
  '/admin/reports',
  '/admin/venues',
];

describe('Admin (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const server = () => context.app.getHttpServer() as Server;

  it.each(ADMIN_ROUTES)('rejects an anonymous request to %s', async (route) => {
    await request(server()).get(route).expect(401);
  });

  it.each(ADMIN_ROUTES)('rejects a non-admin session on %s', async (route) => {
    const cookie = await context.accessCookie('u1', 'student@eafit.edu.co');

    await request(server()).get(route).set('Cookie', cookie).expect(403);
  });

  it('lets an allowlisted admin list users', async () => {
    const cookie = await context.accessCookie('u9', 'admin@eafit.edu.co');
    context.prisma.user.findMany.mockResolvedValue([
      {
        id: 'u1',
        email: 'ana@eafit.edu.co',
        cellphone: '+573001112233',
        isVerified: true,
        createdAt: new Date('2026-01-01'),
        profile: null,
      },
    ]);
    context.prisma.match.findMany.mockResolvedValue([]);

    const response = await request(server())
      .get('/admin/users')
      .set('Cookie', cookie)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({ id: 'u1', matchCount: 0 });
  });

  it('answers 404 for a match that does not exist', async () => {
    const cookie = await context.accessCookie('u9', 'admin@eafit.edu.co');
    context.prisma.match.findUnique.mockResolvedValue(null);

    await request(server())
      .get('/admin/matches/ghost')
      .set('Cookie', cookie)
      .expect(404);
  });

  it('rejects an unknown status when pausing a user', async () => {
    const cookie = await context.accessCookie('u9', 'admin@eafit.edu.co');

    await request(server())
      .patch('/admin/users/u1/status')
      .set('Cookie', cookie)
      .send({ status: 'NOT_A_STATUS' })
      .expect(400);
  });

  it('rejects creating a venue with an invalid payload', async () => {
    const cookie = await context.accessCookie('u9', 'admin@eafit.edu.co');

    await request(server())
      .post('/admin/venues')
      .set('Cookie', cookie)
      .send({ name: '' })
      .expect(400);
  });
});
