import { createHash } from 'crypto';
import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';
import { dateMatch, dateViewLink } from './date-view.fixtures';

const TOKEN = 'date-token';

describe('GET /dates/:token (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.availabilityLink.findUnique.mockResolvedValue(
      dateViewLink(),
    );
    context.prisma.match.findUnique.mockResolvedValue(dateMatch());
  });

  const getDate = (token = TOKEN) =>
    request(context.app.getHttpServer() as Server).get(`/dates/${token}`);

  it('serves the date to anyone holding the token', async () => {
    const response = await getDate().expect(200);

    expect(response.body).toMatchObject({
      viewer: { name: 'Ana', university: 'EAFIT' },
      partner: {
        name: 'Beto',
        university: 'CES',
        photoUrl: 'https://cdn/b.jpg',
      },
      venue: { name: 'Pergamino', address: 'Cra 37' },
      scheduledAt: '2026-07-10T20:00:00.000Z',
      sharedHobbies: ['Café de especialidad'],
    });
  });

  it('looks the token up by its hash, never in the clear', async () => {
    await getDate().expect(200);

    expect(context.prisma.availabilityLink.findUnique).toHaveBeenCalledWith({
      where: {
        tokenHash: createHash('sha256').update(TOKEN).digest('hex'),
      },
    });
  });

  it('answers 404 to an unknown token', async () => {
    context.prisma.availabilityLink.findUnique.mockResolvedValue(null);

    await getDate('nope').expect(404);
  });

  it('refuses a scheduling link as a pass to the date page', async () => {
    context.prisma.availabilityLink.findUnique.mockResolvedValue(
      dateViewLink({ step: 'AVAILABILITY' }),
    );

    await getDate().expect(404);
  });

  it('answers 410 once the link expired', async () => {
    context.prisma.availabilityLink.findUnique.mockResolvedValue(
      dateViewLink({ expiresAt: new Date(Date.now() - 1000) }),
    );

    await getDate().expect(410);
  });

  it('answers 410 when the date is no longer scheduled', async () => {
    context.prisma.match.findUnique.mockResolvedValue(
      dateMatch({ date: null }),
    );

    await getDate().expect(410);
  });
});
