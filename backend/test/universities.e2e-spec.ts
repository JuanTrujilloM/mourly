import request from 'supertest';
import type { Server } from 'http';
import { TEST_UNIVERSITIES, createTestApp, type TestApp } from './setup-app';
import { UNSUPPORTED_UNIVERSITY_MESSAGE } from '../src/modules/universities/university-messages';

describe('Universities admin CRUD (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.university.findMany.mockResolvedValue(TEST_UNIVERSITIES);
    context.prisma.university.findUnique.mockImplementation(
      ({ where }: { where: { domain?: string; id?: string } }) =>
        Promise.resolve(
          TEST_UNIVERSITIES.find(
            (university) =>
              university.domain === where.domain || university.id === where.id,
          ) ?? null,
        ),
    );
  });

  const server = () => context.app.getHttpServer() as Server;
  const asAdmin = () => context.accessCookie('u9', 'admin@eafit.edu.co');

  it('rejects an anonymous request', async () => {
    await request(server()).get('/admin/universities').expect(401);
  });

  it('rejects a non-admin session', async () => {
    const cookie = await context.accessCookie('u1', 'student@eafit.edu.co');

    await request(server())
      .get('/admin/universities')
      .set('Cookie', cookie)
      .expect(403);
  });

  it('lists the universities for an admin', async () => {
    const response = await request(server())
      .get('/admin/universities')
      .set('Cookie', await asAdmin())
      .expect(200);

    expect(response.body).toHaveLength(2);
  });

  it('creates a university and normalizes the domain', async () => {
    context.prisma.university.create.mockResolvedValue({ id: 'uni_unal' });

    await request(server())
      .post('/admin/universities')
      .set('Cookie', await asAdmin())
      .send({ domain: '  UNAL.edu.co ', name: 'Nacional', city: 'Bogotá' })
      .expect(201);

    expect(
      context.prisma.university.create.mock.calls[0][0].data,
    ).toMatchObject({ domain: 'unal.edu.co', active: true });
  });

  it('refuses a domain that already exists', async () => {
    await request(server())
      .post('/admin/universities')
      .set('Cookie', await asAdmin())
      .send({ domain: 'eafit.edu.co', name: 'Otra', city: 'Medellín' })
      .expect(409);
  });

  it('rejects a malformed domain', async () => {
    await request(server())
      .post('/admin/universities')
      .set('Cookie', await asAdmin())
      .send({ domain: 'not a domain', name: 'X', city: 'Y' })
      .expect(400);
  });

  it('rejects a payload with no name', async () => {
    await request(server())
      .post('/admin/universities')
      .set('Cookie', await asAdmin())
      .send({ domain: 'unal.edu.co', city: 'Bogotá' })
      .expect(400);
  });

  it('answers 404 when updating a university that does not exist', async () => {
    context.prisma.university.findUnique.mockResolvedValue(null);

    await request(server())
      .patch('/admin/universities/ghost')
      .set('Cookie', await asAdmin())
      .send({ name: 'Nuevo' })
      .expect(404);
  });

  it('deactivates instead of deleting', async () => {
    context.prisma.university.update.mockResolvedValue({ id: 'uni_eafit' });

    await request(server())
      .delete('/admin/universities/uni_eafit')
      .set('Cookie', await asAdmin())
      .expect(200);

    expect(context.prisma.university.update).toHaveBeenCalledWith({
      where: { id: 'uni_eafit' },
      data: { active: false },
    });
  });

  it('blocks registration from a domain that is not registered', async () => {
    const response = await request(server())
      .post('/auth/register')
      .send({ email: 'ana@unregistered.edu.co', cellphone: '+573001112233' })
      .expect(400);

    expect(response.body.message).toContain(UNSUPPORTED_UNIVERSITY_MESSAGE);
  });
});
