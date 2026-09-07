import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';

const LEAD = {
  name: 'Emmanuel Maya',
  email: 'emaya@correo.iue.edu.co',
  cellphone: '+573014983968',
};

describe('Waitlist (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.waitlistEntry.upsert.mockResolvedValue({ id: 'w1' });
  });

  const server = () => context.app.getHttpServer() as Server;

  describe('POST /waitlist', () => {
    it('accepts a lead from a university Mourly has not reached', async () => {
      const response = await request(server())
        .post('/waitlist')
        .send(LEAD)
        .expect(200);

      expect(response.body.message).toBe(
        'Listo. Te escribimos apenas abramos en tu universidad.',
      );
      expect(context.prisma.waitlistEntry.upsert).toHaveBeenCalled();
    });

    it('rejects a lead whose university is already supported', async () => {
      const response = await request(server())
        .post('/waitlist')
        .send({ ...LEAD, email: 'ana@eafit.edu.co' })
        .expect(400);

      expect(response.body.message).toBe(
        'Tu universidad ya está en Mourly. Registrate con tu correo institucional.',
      );
      expect(context.prisma.waitlistEntry.upsert).not.toHaveBeenCalled();
    });

    it('rejects an invalid cellphone', async () => {
      await request(server())
        .post('/waitlist')
        .send({ ...LEAD, cellphone: '123' })
        .expect(400);
    });

    it('rejects a blank name', async () => {
      await request(server())
        .post('/waitlist')
        .send({ ...LEAD, name: 'E' })
        .expect(400);
    });

    it('drops unknown fields instead of storing them', async () => {
      await request(server())
        .post('/waitlist')
        .send({ ...LEAD, isAdmin: true })
        .expect(200);

      const [{ create }] = context.prisma.waitlistEntry.upsert.mock
        .calls[0] as [{ create: Record<string, unknown> }];
      expect(create).not.toHaveProperty('isAdmin');
    });
  });

  describe('GET /admin/waitlist', () => {
    it('rejects an anonymous visitor', async () => {
      await request(server()).get('/admin/waitlist').expect(401);
    });

    it('rejects a signed in non admin', async () => {
      const cookie = await context.accessCookie('u1', 'ana@eafit.edu.co');

      await request(server())
        .get('/admin/waitlist')
        .set('Cookie', cookie)
        .expect(403);
    });

    it('lists the leads for an admin', async () => {
      const cookie = await context.accessCookie('u2', 'admin@eafit.edu.co');
      context.prisma.waitlistEntry.findMany.mockResolvedValue([
        { id: 'w1', ...LEAD },
      ]);

      const response = await request(server())
        .get('/admin/waitlist')
        .set('Cookie', cookie)
        .expect(200);

      expect(response.body).toHaveLength(1);
    });
  });
});
