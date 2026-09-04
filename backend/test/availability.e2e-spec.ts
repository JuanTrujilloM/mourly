import { createHash } from 'crypto';
import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';

const TOKEN = 'a-public-flow-token';

function hashed(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function link(step: 'VENUE' | 'AVAILABILITY', overrides = {}) {
  return {
    id: 'link-1',
    matchId: 'm1',
    userId: 'u1',
    step,
    tokenHash: hashed(TOKEN),
    expiresAt: new Date(Date.now() + 3600_000),
    consumedAt: null,
    ...overrides,
  };
}

describe('Availability public flow (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.match.findUnique.mockResolvedValue({
      userAId: 'u1',
      userBId: 'u2',
      createdAt: new Date('2026-07-09T19:00:00Z'),
      userA: { profile: { name: 'Ana' } },
      userB: { profile: { name: 'Beto' } },
    });
  });

  const server = () => context.app.getHttpServer() as Server;

  it('needs no session to open the flow', async () => {
    context.prisma.availabilityLink.findUnique.mockResolvedValue(
      link('AVAILABILITY'),
    );

    const response = await request(server())
      .get(`/availability/${TOKEN}`)
      .expect(200);

    expect(response.body).toMatchObject({
      step: 'AVAILABILITY',
      partnerName: 'Beto',
    });
    expect(response.body.days).toHaveLength(7);
  });

  it('answers 404 for an unknown token', async () => {
    context.prisma.availabilityLink.findUnique.mockResolvedValue(null);

    await request(server()).get('/availability/nope').expect(404);
  });

  it('answers 410 for an expired token', async () => {
    context.prisma.availabilityLink.findUnique.mockResolvedValue(
      link('AVAILABILITY', { expiresAt: new Date(Date.now() - 1000) }),
    );

    await request(server()).get(`/availability/${TOKEN}`).expect(410);
  });

  it('reports a consumed link as completed rather than an error', async () => {
    context.prisma.availabilityLink.findUnique.mockResolvedValue(
      link('AVAILABILITY', { consumedAt: new Date() }),
    );

    const response = await request(server())
      .get(`/availability/${TOKEN}`)
      .expect(200);

    expect(response.body).toEqual({ step: 'COMPLETED' });
  });

  it('rejects a slot list that is empty', async () => {
    context.prisma.availabilityLink.findUnique.mockResolvedValue(
      link('AVAILABILITY'),
    );

    await request(server())
      .post(`/availability/${TOKEN}`)
      .send({ slots: [] })
      .expect(400);
  });

  it('rejects a slot list beyond the calendar size', async () => {
    context.prisma.availabilityLink.findUnique.mockResolvedValue(
      link('AVAILABILITY'),
    );
    const slots = Array.from({ length: 50 }, () => ({
      date: '2026-07-10',
      timeSlot: '12:00',
    }));

    await request(server())
      .post(`/availability/${TOKEN}`)
      .send({ slots })
      .expect(400);
  });

  it('rejects an unknown time slot', async () => {
    context.prisma.availabilityLink.findUnique.mockResolvedValue(
      link('AVAILABILITY'),
    );

    await request(server())
      .post(`/availability/${TOKEN}`)
      .send({ slots: [{ date: '2026-07-10', timeSlot: '03:00' }] })
      .expect(400);
  });

  it('requires exactly two venues on selection', async () => {
    context.prisma.availabilityLink.findUnique.mockResolvedValue(link('VENUE'));

    await request(server())
      .post(`/availability/${TOKEN}/venues`)
      .send({ venueIds: ['v1'] })
      .expect(400);
  });

  it('rejects choosing venues that were never suggested', async () => {
    context.prisma.availabilityLink.findUnique.mockResolvedValue(link('VENUE'));
    context.prisma.match.findUnique.mockResolvedValue({
      id: 'm1',
      userAId: 'u1',
      userBId: 'u2',
    });
    context.prisma.venueOption.findMany.mockResolvedValue([
      { venueId: 'v1' },
      { venueId: 'v2' },
      { venueId: 'v3' },
    ]);

    await request(server())
      .post(`/availability/${TOKEN}/venues`)
      .send({ venueIds: ['v1', 'v9'] })
      .expect(400);
  });
});
