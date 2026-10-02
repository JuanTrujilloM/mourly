import { createHash } from 'crypto';
import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, type TestApp } from './setup-app';

const TOKEN = 'a-public-profile-token';

function partner(name: string) {
  return {
    profile: {
      name,
      dateOfBirth: new Date('2002-01-15'),
      university: 'CES',
      major: 'Psicología',
      semester: '7',
      biography: 'Teatro y cine club.',
      photos: [{ key: 'https://cdn/b.jpg', isPrimary: true }],
      hobbies: [{ hobby: { name: 'Teatro' } }],
    },
  };
}

function matchWith(status: string) {
  return {
    userAId: 'u1',
    status,
    userA: partner('Ana Restrepo'),
    userB: partner('Beto Pérez'),
  };
}

describe('Match profile behind the SMS link (e2e)', () => {
  let context: TestApp;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.availabilityLink.findUnique.mockResolvedValue({
      id: 'link-1',
      matchId: 'm1',
      userId: 'u1',
      step: 'VENUE',
      tokenHash: createHash('sha256').update(TOKEN).digest('hex'),
      expiresAt: new Date(Date.now() + 3600_000),
      consumedAt: null,
    });
  });

  const server = () => context.app.getHttpServer() as Server;

  it('shows the partner by first name without a session', async () => {
    context.prisma.match.findUnique.mockResolvedValue(matchWith('pending'));

    const response = await request(server())
      .get(`/availability/${TOKEN}/profile`)
      .expect(200);

    expect(response.body).toMatchObject({
      step: 'VENUE',
      partner: { firstName: 'Beto', photos: ['https://cdn/b.jpg'] },
      sharedHobbies: ['Teatro'],
    });
    expect(JSON.stringify(response.body)).not.toContain('Pérez');
  });

  it.each(['rejected', 'expired'])(
    'answers 410 once the match is %s',
    async (status) => {
      context.prisma.match.findUnique.mockResolvedValue(matchWith(status));

      const response = await request(server())
        .get(`/availability/${TOKEN}/profile`)
        .expect(410);

      expect(JSON.stringify(response.body)).not.toContain('cdn');
    },
  );
});
