import { PrismaService } from '../../config/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MatchResponseService } from './match-response.service';

function setup(match: unknown = { id: 'm1', userAId: 'u1', userBId: 'u2' }) {
  const findFirst = jest.fn().mockResolvedValue(match);
  const matchUpdate = jest.fn().mockResolvedValue({});
  const dateDeleteMany = jest.fn().mockResolvedValue({ count: 0 });
  const userFindUnique = jest.fn().mockResolvedValue({
    email: 'b@ces.edu.co',
    cellphone: '+2',
    profile: { name: 'Beto' },
  });

  const prisma = {
    match: { findFirst, update: matchUpdate },
    date: { deleteMany: dateDeleteMany },
    user: { findUnique: userFindUnique },
    $transaction: (operations: Promise<unknown>[]) => Promise.all(operations),
  } as unknown as PrismaService;

  const notifications = {
    send: jest.fn().mockResolvedValue(undefined),
  };

  const service = new MatchResponseService(
    prisma,
    notifications as unknown as NotificationsService,
  );
  return {
    service,
    notifications,
    matchUpdate,
    dateDeleteMany,
    userFindUnique,
  };
}

describe('MatchResponseService', () => {
  it('reports when the user has no active match', async () => {
    const { service } = setup(null);

    expect(await service.reject('u1')).toBe('no_active_match');
  });

  it('marks the match rejected and records who did it', async () => {
    const { service, matchUpdate } = setup();

    expect(await service.reject('u1')).toBe('rejected');
    expect(matchUpdate.mock.calls[0][0].data).toMatchObject({
      status: 'rejected',
      rejectedById: 'u1',
    });
  });

  it('removes any scheduled date alongside the rejection', async () => {
    const { service, dateDeleteMany } = setup();

    await service.reject('u1');

    expect(dateDeleteMany).toHaveBeenCalledWith({ where: { matchId: 'm1' } });
  });

  it('notifies the other user, not the one who rejected', async () => {
    const { service, userFindUnique } = setup();

    await service.reject('u1');

    expect(userFindUnique.mock.calls[0][0].where).toEqual({ id: 'u2' });
  });

  it('notifies the first user when the second rejects', async () => {
    const { service, userFindUnique } = setup();

    await service.reject('u2');

    expect(userFindUnique.mock.calls[0][0].where).toEqual({ id: 'u1' });
  });

  it('records a timeout rejection with no author', async () => {
    const { service, matchUpdate } = setup();

    await service.terminate('m1', null);

    expect(matchUpdate.mock.calls[0][0].data.rejectedById).toBeNull();
  });

  it('skips the notification when the user is gone', async () => {
    const { service, notifications, userFindUnique } = setup();
    userFindUnique.mockResolvedValue(null);

    await service.notifyRejected('ghost');

    expect(notifications.send).not.toHaveBeenCalled();
  });
});
