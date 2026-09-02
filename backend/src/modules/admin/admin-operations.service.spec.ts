import { Logger } from '@nestjs/common';
import { MatchInviteService } from '../matches/match-invite.service';
import { WeeklyMatchingService } from '../matches/weekly-matching.service';
import { AdminOperationsService } from './admin-operations.service';

const PAIR = { userAId: 'a', userBId: 'b', compatibilityScore: 9.1 };

function setup(pairs = [PAIR]) {
  const weekly = { runWeeklyMatching: jest.fn().mockResolvedValue(pairs) };
  const invites = { inviteForPairs: jest.fn().mockResolvedValue(undefined) };

  const service = new AdminOperationsService(
    weekly as unknown as WeeklyMatchingService,
    invites as unknown as MatchInviteService,
  );
  return { service, weekly, invites };
}

describe('AdminOperationsService', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('runs the same matching the weekly cron runs', async () => {
    const { service, weekly } = setup();

    await service.runWeeklyMatching();

    expect(weekly.runWeeklyMatching).toHaveBeenCalled();
  });

  it('invites the pairs it created', async () => {
    const { service, invites } = setup();

    await service.runWeeklyMatching();

    expect(invites.inviteForPairs).toHaveBeenCalledWith([PAIR]);
  });

  it('reports how many matches were created', async () => {
    const { service } = setup();

    expect(await service.runWeeklyMatching()).toEqual({
      created: 1,
      pairs: [PAIR],
    });
  });

  it('reports an empty run when nobody was eligible', async () => {
    const { service, invites } = setup([]);

    expect(await service.runWeeklyMatching()).toEqual({
      created: 0,
      pairs: [],
    });
    expect(invites.inviteForPairs).toHaveBeenCalledWith([]);
  });
});
