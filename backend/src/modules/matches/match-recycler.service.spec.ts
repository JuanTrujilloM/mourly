import { Logger } from '@nestjs/common';
import { MatchLoaderService } from './match-loader.service';
import { MatchReschedulerService } from './match-rescheduler.service';
import { MatchRecyclerService } from './match-recycler.service';

function setup(overdue: { id: string }[] = []) {
  const loader = { loadOverdue: jest.fn().mockResolvedValue(overdue) };
  const rescheduler = { recycle: jest.fn().mockResolvedValue('recycled') };

  const service = new MatchRecyclerService(
    loader as unknown as MatchLoaderService,
    rescheduler as unknown as MatchReschedulerService,
  );
  return { service, loader, rescheduler };
}

describe('MatchRecyclerService', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads overdue matches in a single query', async () => {
    const { service, loader } = setup();

    await service.recycleExpired();

    expect(loader.loadOverdue).toHaveBeenCalledTimes(1);
    expect(loader.loadOverdue.mock.calls[0][0]).toBeInstanceOf(Date);
  });

  it('recycles every overdue match', async () => {
    const { service, rescheduler } = setup([{ id: 'm1' }, { id: 'm2' }]);

    await service.recycleExpired();

    expect(rescheduler.recycle).toHaveBeenCalledTimes(2);
  });

  it('keeps going when one match fails to recycle', async () => {
    const { service, rescheduler } = setup([{ id: 'm1' }, { id: 'm2' }]);
    rescheduler.recycle.mockRejectedValueOnce(new Error('boom'));

    await service.recycleExpired();

    expect(rescheduler.recycle).toHaveBeenCalledTimes(2);
    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it('does nothing when nothing is overdue', async () => {
    const { service, rescheduler } = setup([]);

    await service.recycleExpired();

    expect(rescheduler.recycle).not.toHaveBeenCalled();
  });
});
