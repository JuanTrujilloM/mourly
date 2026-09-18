import { PrismaService } from '../../config/prisma.service';
import { JobClaimService } from '../scheduling/job-claim.service';
import { UnverifiedAccountCleanupService } from './unverified-account-cleanup.service';

function setup(claimed = true) {
  const deleteMany = jest.fn().mockResolvedValue({ count: 3 });
  const prisma = { user: { deleteMany } } as unknown as PrismaService;
  const jobs = { claim: jest.fn().mockResolvedValue(claimed) };
  const service = new UnverifiedAccountCleanupService(
    prisma,
    jobs as unknown as JobClaimService,
  );
  return { service, deleteMany, jobs };
}

describe('UnverifiedAccountCleanupService', () => {
  it('deletes accounts that never verified within the retention window', async () => {
    const { service, deleteMany } = setup();
    const now = new Date('2026-09-18T04:00:00Z');

    expect(await service.purge(now)).toBe(3);

    expect(deleteMany).toHaveBeenCalledWith({
      where: {
        isVerified: false,
        createdAt: { lt: new Date('2026-09-11T04:00:00Z') },
      },
    });
  });

  it('does nothing when another instance claimed the tick', async () => {
    const { service, deleteMany, jobs } = setup(false);

    expect(await service.purge()).toBe(0);

    expect(jobs.claim).toHaveBeenCalledWith(
      'unverified-account-cleanup',
      expect.any(Date),
    );
    expect(deleteMany).not.toHaveBeenCalled();
  });
});
