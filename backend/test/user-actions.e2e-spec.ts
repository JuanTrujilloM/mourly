import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';

const PAST_DATE = {
  id: 'd1',
  scheduledAt: new Date('2020-01-01T20:00:00Z'),
};

describe('User actions (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.date.findFirst.mockResolvedValue(PAST_DATE);
    context.prisma.feedback.findUnique.mockResolvedValue(null);
    context.prisma.feedback.create.mockResolvedValue({ id: 'f1' });
    context.prisma.feedback.count.mockResolvedValue(1);
    context.prisma.match.findFirst.mockResolvedValue({
      id: 'm1',
      userAId: 'u1',
      userBId: 'u2',
    });
    context.prisma.report.upsert.mockResolvedValue({ id: 'r1' });
  });

  const server = () => context.app.getHttpServer() as Server;
  const asUser = () => context.accessCookie('u1', 'ana@eafit.edu.co');

  describe('POST /dates/:id/feedback', () => {
    it('rejects an anonymous request', async () => {
      await request(server())
        .post('/dates/d1/feedback')
        .send({ occurred: true, rating: 5 })
        .expect(401);
    });

    it('records the answer for a participant', async () => {
      await request(server())
        .post('/dates/d1/feedback')
        .set('Cookie', await asUser())
        .send({ occurred: true, rating: 5, comments: 'Genial' })
        .expect(201);

      expect(context.prisma.feedback.create).toHaveBeenCalled();
    });

    it('answers 404 for a date the user did not take part in', async () => {
      context.prisma.date.findFirst.mockResolvedValue(null);

      await request(server())
        .post('/dates/d1/feedback')
        .set('Cookie', await asUser())
        .send({ occurred: true, rating: 5 })
        .expect(404);
    });

    it('rejects a rating outside 1 to 5', async () => {
      await request(server())
        .post('/dates/d1/feedback')
        .set('Cookie', await asUser())
        .send({ occurred: true, rating: 9 })
        .expect(400);
    });

    it('requires a rating when the date happened', async () => {
      await request(server())
        .post('/dates/d1/feedback')
        .set('Cookie', await asUser())
        .send({ occurred: true })
        .expect(400);
    });

    it('answers 409 on a second submission', async () => {
      context.prisma.feedback.findUnique.mockResolvedValue({ id: 'f0' });

      await request(server())
        .post('/dates/d1/feedback')
        .set('Cookie', await asUser())
        .send({ occurred: true, rating: 5 })
        .expect(409);
    });
  });

  describe('POST /matches/:id/report', () => {
    it('rejects an anonymous request', async () => {
      await request(server()).post('/matches/m1/report').send({}).expect(401);
    });

    it('reports the partner of the match', async () => {
      await request(server())
        .post('/matches/m1/report')
        .set('Cookie', await asUser())
        .send({ reason: 'Comportamiento inapropiado' })
        .expect(201);

      expect(
        context.prisma.report.upsert.mock.calls[0][0].create,
      ).toMatchObject({ userAId: 'u1', userBId: 'u2' });
    });

    it('answers 404 for a match the user is not part of', async () => {
      context.prisma.match.findFirst.mockResolvedValue(null);

      await request(server())
        .post('/matches/m1/report')
        .set('Cookie', await asUser())
        .send({})
        .expect(404);
    });

    it('rejects an oversized reason', async () => {
      await request(server())
        .post('/matches/m1/report')
        .set('Cookie', await asUser())
        .send({ reason: 'x'.repeat(501) })
        .expect(400);
    });
  });

  describe('POST /matches/current/reject', () => {
    it('rejects an anonymous request', async () => {
      await request(server()).post('/matches/current/reject').expect(401);
    });

    it('terminates the active match', async () => {
      context.prisma.user.findUnique.mockResolvedValue({
        email: 'b@ces.edu.co',
        cellphone: '+2',
        profile: { name: 'Beto' },
      });

      const response = await request(server())
        .post('/matches/current/reject')
        .set('Cookie', await asUser())
        .expect(200);

      expect(response.body).toEqual({ status: 'rejected' });
      expect(context.prisma.match.update.mock.calls[0][0].data).toMatchObject({
        status: 'rejected',
        rejectedById: 'u1',
      });
    });

    it('answers 404 when there is no active match', async () => {
      context.prisma.match.findFirst.mockResolvedValue(null);

      await request(server())
        .post('/matches/current/reject')
        .set('Cookie', await asUser())
        .expect(404);
    });
  });
});
