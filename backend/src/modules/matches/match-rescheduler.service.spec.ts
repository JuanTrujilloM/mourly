import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { AvailabilityLinkIssuerService } from '../availability-link/availability-link-issuer.service';
import { AvailabilityLinkService } from '../availability-link/availability-link.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MatchReschedulerService } from './match-rescheduler.service';
import type { LoadedMatch } from './match-loader.service';

function buildMatch(scheduleAttempts = 0): LoadedMatch {
  return {
    id: 'm1',
    userAId: 'a',
    userBId: 'b',
    status: 'pending',
    scheduleAttempts,
    date: null,
    availabilities: [],
    venueOptions: [],
    userA: {
      id: 'a',
      email: 'a@eafit.edu.co',
      cellphone: '+1',
      profile: { name: 'Ana' },
    },
    userB: {
      id: 'b',
      email: 'b@ces.edu.co',
      cellphone: '+2',
      profile: { name: 'Beto' },
    },
  };
}

function setup(env: Record<string, string> = {}) {
  const update = jest.fn().mockResolvedValue({});
  const prisma = {
    match: { update },
    $transaction: (operations: Promise<unknown>[]) => Promise.all(operations),
  } as unknown as PrismaService;
  const config = { get: (key: string) => env[key] } as unknown as ConfigService;
  const links = {
    issueForMatchUser: jest.fn().mockResolvedValue('new-token'),
  };
  const linkState = {
    revokeForMatch: jest.fn().mockResolvedValue({ count: 2 }),
  };
  const notifications = {
    send: jest.fn().mockResolvedValue(undefined),
  };

  const service = new MatchReschedulerService(
    prisma,
    config,
    links as unknown as AvailabilityLinkIssuerService,
    linkState as unknown as AvailabilityLinkService,
    notifications as unknown as NotificationsService,
  );
  return { service, update, links, linkState, notifications };
}

describe('MatchReschedulerService', () => {
  describe('handleNoOverlap', () => {
    it('nudges both users on the first failure', async () => {
      const { service, notifications } = setup();

      expect(await service.handleNoOverlap(buildMatch(0))).toBe('nudged');
      expect(notifications.send).toHaveBeenCalledTimes(2);
    });

    it('reissues links straight at the availability step', async () => {
      const { service, links } = setup();

      await service.handleNoOverlap(buildMatch(0));

      expect(links.issueForMatchUser).toHaveBeenCalledWith(
        'm1',
        'a',
        'AVAILABILITY',
      );
      expect(links.issueForMatchUser).toHaveBeenCalledWith(
        'm1',
        'b',
        'AVAILABILITY',
      );
    });

    it('records the attempt and a fresh deadline', async () => {
      const { service, update } = setup();

      await service.handleNoOverlap(buildMatch(0));

      expect(update.mock.calls[0][0].data.scheduleAttempts).toEqual({
        increment: 1,
      });
      expect(update.mock.calls[0][0].data.scheduleDeadline).toBeInstanceOf(
        Date,
      );
    });

    it('builds the nudge url from the configured frontend', async () => {
      const { service, notifications } = setup({
        FRONTEND_URL: 'https://app.test',
      });

      await service.handleNoOverlap(buildMatch(0));

      expect(notifications.send.mock.calls[0][0].availabilityUrl).toBe(
        'https://app.test/availability/new-token',
      );
    });

    it('falls back to localhost without configuration', async () => {
      const { service, notifications } = setup();

      await service.handleNoOverlap(buildMatch(0));

      expect(notifications.send.mock.calls[0][0].availabilityUrl).toContain(
        'http://localhost:3000',
      );
    });

    it('recycles instead of nudging once the attempt cap is reached', async () => {
      const { service, notifications } = setup();

      expect(await service.handleNoOverlap(buildMatch(1))).toBe('recycled');
      expect(notifications.send).toHaveBeenCalledTimes(2);
    });
  });

  describe('recycle', () => {
    it('expires the match and tells both users', async () => {
      const { service, update, notifications } = setup();

      expect(await service.recycle(buildMatch())).toBe('recycled');
      expect(update).toHaveBeenCalledWith({
        where: { id: 'm1' },
        data: { status: 'expired' },
      });
      expect(notifications.send).toHaveBeenCalledTimes(2);
    });

    it('revokes the match links so the flow cannot be reopened', async () => {
      const { service, linkState } = setup();

      await service.recycle(buildMatch());

      expect(linkState.revokeForMatch).toHaveBeenCalledWith('m1');
    });

    it('revokes the links when the attempt cap recycles the match', async () => {
      const { service, linkState } = setup();

      await service.handleNoOverlap(buildMatch(1));

      expect(linkState.revokeForMatch).toHaveBeenCalledWith('m1');
    });

    it('keeps the links alive while it only nudges', async () => {
      const { service, linkState } = setup();

      await service.handleNoOverlap(buildMatch(0));

      expect(linkState.revokeForMatch).not.toHaveBeenCalled();
    });
  });
});
