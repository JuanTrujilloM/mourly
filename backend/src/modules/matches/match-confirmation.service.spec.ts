import { PrismaService } from '../../config/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MatchConfirmationService } from './match-confirmation.service';
import { MatchLoaderService, type LoadedMatch } from './match-loader.service';
import { MatchReschedulerService } from './match-rescheduler.service';
import { DateLinkService } from './date-link.service';

function slot(userId: string, day: string, timeSlot: string) {
  return { userId, date: new Date(`${day}T00:00:00Z`), timeSlot };
}

function completedMatch(overrides: Partial<LoadedMatch> = {}): LoadedMatch {
  return {
    id: 'm1',
    userAId: 'a',
    userBId: 'b',
    status: 'pending',
    scheduleAttempts: 0,
    date: null,
    availabilities: [
      slot('a', '2026-07-10', '15:00'),
      slot('b', '2026-07-10', '15:00'),
    ],
    venueOptions: [
      {
        venueId: 'v1',
        userASelected: true,
        userBSelected: true,
        venue: { name: 'Pergamino', address: 'Cra 37' },
      },
      {
        venueId: 'v2',
        userASelected: true,
        userBSelected: true,
        venue: { name: 'Velvet', address: 'Cra 33' },
      },
    ],
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
    ...overrides,
  };
}

function setup(match: LoadedMatch | null = completedMatch()) {
  const dateCreate = jest.fn().mockResolvedValue({});
  const matchUpdate = jest.fn().mockResolvedValue({});
  const prisma = {
    date: { create: dateCreate },
    match: { update: matchUpdate },
    $transaction: (operations: Promise<unknown>[]) => Promise.all(operations),
  } as unknown as PrismaService;

  const loader = { loadById: jest.fn().mockResolvedValue(match) };
  const notifications = {
    send: jest.fn().mockResolvedValue(undefined),
  };
  const rescheduler = {
    handleNoOverlap: jest.fn().mockResolvedValue('nudged'),
  };
  const dateLinks = {
    urlFor: jest
      .fn()
      .mockImplementation((_matchId: string, userId: string) =>
        Promise.resolve(`https://mourly.com/cita/token-${userId}`),
      ),
  };

  const service = new MatchConfirmationService(
    prisma,
    loader as unknown as MatchLoaderService,
    notifications as unknown as NotificationsService,
    rescheduler as unknown as MatchReschedulerService,
    dateLinks as unknown as DateLinkService,
  );
  return {
    service,
    loader,
    notifications,
    rescheduler,
    dateLinks,
    dateCreate,
    matchUpdate,
  };
}

describe('MatchConfirmationService', () => {
  it('waits when the match no longer exists', async () => {
    const { service } = setup(null);

    expect(await service.tryConfirm('m1')).toBe('waiting');
  });

  it('is a no-op once a date exists', async () => {
    const { service } = setup(completedMatch({ date: { id: 'd1' } }));

    expect(await service.tryConfirm('m1')).toBe('already_scheduled');
  });

  it('is a no-op once the match left the active statuses', async () => {
    const { service } = setup(completedMatch({ status: 'expired' }));

    expect(await service.tryConfirm('m1')).toBe('already_scheduled');
  });

  it('waits until both users finished the flow', async () => {
    const { service } = setup(completedMatch({ availabilities: [] }));

    expect(await service.tryConfirm('m1')).toBe('waiting');
  });

  it('creates the date and confirms the match on an overlap', async () => {
    const { service, dateCreate, matchUpdate } = setup();

    expect(await service.tryConfirm('m1')).toBe('confirmed');
    expect(dateCreate.mock.calls[0][0].data).toMatchObject({
      matchId: 'm1',
      venueId: 'v1',
      status: 'accepted',
    });
    expect(matchUpdate).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: { status: 'confirmed' },
    });
  });

  it('notifies both users with their partner name', async () => {
    const { service, notifications } = setup();

    await service.tryConfirm('m1');

    const names = notifications.send.mock.calls.map(
      (call: [{ partnerName: string }]) => call[0].partnerName,
    );
    expect(names.sort()).toEqual(['Ana', 'Beto']);
  });

  it('sends each user their own link to the date page', async () => {
    const { service, notifications, dateLinks } = setup();

    await service.tryConfirm('m1');

    const urls = notifications.send.mock.calls.map(
      (call: [{ dateUrl: string | null }]) => call[0].dateUrl,
    );
    expect(urls.sort()).toEqual([
      'https://mourly.com/cita/token-a',
      'https://mourly.com/cita/token-b',
    ]);
    expect(dateLinks.urlFor).toHaveBeenCalledWith(
      'm1',
      'a',
      new Date('2026-07-10T20:00:00Z'),
    );
  });

  it('still announces the date when a link cannot be issued', async () => {
    const { service, notifications, dateLinks } = setup();
    dateLinks.urlFor.mockResolvedValue(null);

    expect(await service.tryConfirm('m1')).toBe('confirmed');
    expect(notifications.send).toHaveBeenCalledTimes(2);
    expect(notifications.send.mock.calls[0][0].dateUrl).toBeNull();
  });

  it('reports already_scheduled when a concurrent confirm wins', async () => {
    const { service, dateCreate } = setup();
    dateCreate.mockImplementation(() => {
      throw new Error('unique violation');
    });

    expect(await service.tryConfirm('m1')).toBe('already_scheduled');
  });

  it('hands over to the rescheduler when no slot overlaps', async () => {
    const { service, rescheduler } = setup(
      completedMatch({
        availabilities: [
          slot('a', '2026-07-10', '15:00'),
          slot('b', '2026-07-11', '16:00'),
        ],
      }),
    );

    expect(await service.tryConfirm('m1')).toBe('nudged');
    expect(rescheduler.handleNoOverlap).toHaveBeenCalled();
  });

  it('hands over to the rescheduler when no venue overlaps', async () => {
    const { service, rescheduler } = setup(
      completedMatch({
        venueOptions: [
          {
            venueId: 'v1',
            userASelected: true,
            userBSelected: false,
            venue: { name: 'Pergamino', address: 'Cra 37' },
          },
          {
            venueId: 'v2',
            userASelected: true,
            userBSelected: false,
            venue: { name: 'Velvet', address: 'Cra 33' },
          },
          {
            venueId: 'v3',
            userASelected: false,
            userBSelected: true,
            venue: { name: 'MAMM', address: 'Cra 44' },
          },
          {
            venueId: 'v4',
            userASelected: false,
            userBSelected: true,
            venue: { name: 'Crepes', address: 'Cra 43' },
          },
        ],
      }),
    );

    await service.tryConfirm('m1');

    expect(rescheduler.handleNoOverlap).toHaveBeenCalled();
  });
});
