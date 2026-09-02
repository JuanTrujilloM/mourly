import { Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { MatchResponseService } from './match-response.service';
import { MatchTimeoutService } from './match-timeout.service';

function setup(stale: { id: string; userAId: string; userBId: string }[] = []) {
  const findMany = jest.fn().mockResolvedValue(stale);
  const prisma = { match: { findMany } } as unknown as PrismaService;
  const responses = {
    terminate: jest.fn().mockResolvedValue(undefined),
    notifyRejected: jest.fn().mockResolvedValue(undefined),
  };

  const service = new MatchTimeoutService(
    prisma,
    responses as unknown as MatchResponseService,
  );
  return { service, findMany, responses };
}

describe('MatchTimeoutService', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('looks only at unscheduled active matches past the cutoff', async () => {
    const { service, findMany } = setup();

    await service.rejectStaleMatches();

    const where = findMany.mock.calls[0][0].where as Record<string, unknown>;
    expect(where.status).toEqual({ in: ['pending', 'confirmed'] });
    expect(where.date).toEqual({ is: null });
    expect(where.createdAt).toHaveProperty('lt');
  });

  it('terminates and notifies both sides of a stale match', async () => {
    const { service, responses } = setup([
      { id: 'm1', userAId: 'a', userBId: 'b' },
    ]);

    await service.rejectStaleMatches();

    expect(responses.terminate).toHaveBeenCalledWith('m1', null);
    expect(responses.notifyRejected).toHaveBeenCalledWith('a');
    expect(responses.notifyRejected).toHaveBeenCalledWith('b');
  });

  it('keeps processing after one match fails', async () => {
    const { service, responses } = setup([
      { id: 'm1', userAId: 'a', userBId: 'b' },
      { id: 'm2', userAId: 'c', userBId: 'd' },
    ]);
    responses.terminate.mockRejectedValueOnce(new Error('boom'));

    await service.rejectStaleMatches();

    expect(responses.terminate).toHaveBeenCalledTimes(2);
    expect(Logger.prototype.error).toHaveBeenCalled();
  });
});
