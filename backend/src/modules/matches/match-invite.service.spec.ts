import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { AvailabilityLinkService } from '../availability-link/availability-link.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MatchInviteService } from './match-invite.service';

const MATCH = {
  id: 'm1',
  userAId: 'a',
  userBId: 'b',
  userA: {
    id: 'a',
    email: 'a@eafit.edu.co',
    cellphone: '+1',
    profile: {
      name: 'Ana',
      dateOfBirth: new Date('2003-01-01'),
      university: 'EAFIT',
      major: 'Derecho',
      photos: [{ url: 'https://cdn/a.jpg', isPrimary: true }],
    },
  },
  userB: {
    id: 'b',
    email: 'b@ces.edu.co',
    cellphone: '+2',
    profile: {
      name: 'Beto',
      dateOfBirth: new Date('2002-01-01'),
      university: 'CES',
      major: 'Medicina',
      photos: [],
    },
  },
};

function setup(env: Record<string, string> = {}) {
  const findUnique = jest.fn().mockResolvedValue(MATCH);
  const findFirst = jest.fn().mockResolvedValue({ id: 'm1' });
  const prisma = {
    match: { findUnique, findFirst },
  } as unknown as PrismaService;

  const config = { get: (key: string) => env[key] } as unknown as ConfigService;
  const links = {
    issueForMatchUser: jest.fn().mockResolvedValue('token-1'),
    ttlHours: jest.fn().mockReturnValue(72),
  };
  const notifications = {
    send: jest.fn().mockResolvedValue(undefined),
  };

  const service = new MatchInviteService(
    prisma,
    config,
    links as unknown as AvailabilityLinkService,
    notifications as unknown as NotificationsService,
  );
  return { service, findUnique, findFirst, links, notifications };
}

describe('MatchInviteService', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns nothing for a match that no longer exists', async () => {
    const { service, findUnique } = setup();
    findUnique.mockResolvedValue(null);

    expect(await service.inviteForMatch('ghost')).toEqual([]);
  });

  it('invites both users of the match', async () => {
    const { service, notifications } = setup();

    const results = await service.inviteForMatch('m1');

    expect(results).toHaveLength(2);
    expect(notifications.send).toHaveBeenCalledTimes(2);
  });

  it('points each link at the places-first flow url', async () => {
    const { service } = setup({ FRONTEND_URL: 'https://app.test' });

    const results = await service.inviteForMatch('m1');

    expect(results[0].url).toBe('https://app.test/flow/token-1/places');
  });

  it('falls back to localhost without configuration', async () => {
    const { service } = setup();

    expect((await service.inviteForMatch('m1'))[0].url).toContain(
      'http://localhost:3000',
    );
  });

  it('reports the link lifetime in whole days', async () => {
    const { service, notifications } = setup();

    await service.inviteForMatch('m1');

    expect(notifications.send.mock.calls[0][0].expiresInDays).toBe(3);
  });

  it('keeps inviting the second user when the first send fails', async () => {
    const { service, notifications } = setup();
    notifications.send.mockRejectedValueOnce(new Error('smtp'));

    const results = await service.inviteForMatch('m1');

    expect(results).toHaveLength(1);
    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it('resolves each generated pair to its stored match', async () => {
    const { service, findFirst, notifications } = setup();

    await service.inviteForPairs([
      { userAId: 'a', userBId: 'b', compatibilityScore: 9 },
    ]);

    expect(findFirst.mock.calls[0][0].where).toEqual({
      userAId: 'a',
      userBId: 'b',
    });
    expect(notifications.send).toHaveBeenCalledTimes(2);
  });

  it('skips a pair with no persisted match', async () => {
    const { service, findFirst, notifications } = setup();
    findFirst.mockResolvedValue(null);

    await service.inviteForPairs([
      { userAId: 'a', userBId: 'b', compatibilityScore: 9 },
    ]);

    expect(notifications.send).not.toHaveBeenCalled();
  });
});
