import { PrismaService } from '../../config/prisma.service';
import { MatchConfirmationService } from './match-confirmation.service';
import { DateAnnouncerService } from './date-announcer.service';
import { MatchLoaderService, type LoadedMatch } from './match-loader.service';
import { completedMatch, slot } from './match-confirmation.test-helpers';
import { MatchReschedulerService } from './match-rescheduler.service';

function setup(match: LoadedMatch | null = completedMatch()) {
  const dateCreate = jest.fn().mockResolvedValue({});
  const matchUpdate = jest.fn().mockResolvedValue({});
  const prisma = {
    date: { create: dateCreate },
    match: { update: matchUpdate },
    $transaction: (operations: Promise<unknown>[]) => Promise.all(operations),
  } as unknown as PrismaService;

  const loader = { loadById: jest.fn().mockResolvedValue(match) };
  const announcer = { announce: jest.fn().mockResolvedValue(undefined) };
  const rescheduler = {
    handleNoOverlap: jest.fn().mockResolvedValue('nudged'),
  };
  const service = new MatchConfirmationService(
    prisma,
    loader as unknown as MatchLoaderService,
    rescheduler as unknown as MatchReschedulerService,
    announcer as unknown as DateAnnouncerService,
  );
  return {
    service,
    loader,
    announcer,
    rescheduler,
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

  it('announces the date with the slot and the venue', async () => {
    const { service, announcer } = setup();

    await service.tryConfirm('m1');

    const [match, confirmedSlot, venue] = announcer.announce.mock.calls[0] as [
      LoadedMatch,
      { label: string },
      { name: string },
    ];
    expect(match.id).toBe('m1');
    expect(confirmedSlot.label).toContain('15:00');
    expect(venue.name).toBe('Pergamino');
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
