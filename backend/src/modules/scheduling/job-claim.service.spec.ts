import { PrismaService } from '../../config/prisma.service';
import { JobClaimService } from './job-claim.service';

const NOW = new Date('2026-09-14T19:00:42.000Z');

function setup(inserted: number) {
  const scheduledJobRun = {
    createMany: jest.fn().mockResolvedValue({ count: inserted }),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  };
  const prisma = { scheduledJobRun } as unknown as PrismaService;
  return { service: new JobClaimService(prisma), scheduledJobRun };
}

describe('JobClaimService', () => {
  it('claims a tick nobody has run yet', async () => {
    const { service, scheduledJobRun } = setup(1);

    await expect(service.claim('weekly-matching', NOW)).resolves.toBe(true);
    expect(scheduledJobRun.createMany).toHaveBeenCalledWith({
      data: [
        {
          jobName: 'weekly-matching',
          scheduledFor: new Date('2026-09-14T19:00:00.000Z'),
        },
      ],
      skipDuplicates: true,
    });
  });

  it('prunes old runs of the same job after claiming', async () => {
    const { service, scheduledJobRun } = setup(1);

    await service.claim('weekly-matching', NOW);

    expect(scheduledJobRun.deleteMany).toHaveBeenCalledWith({
      where: {
        jobName: 'weekly-matching',
        scheduledFor: { lt: new Date('2026-08-15T19:00:42.000Z') },
      },
    });
  });

  it('refuses a tick another instance already claimed', async () => {
    const { service, scheduledJobRun } = setup(0);

    await expect(service.claim('weekly-matching', NOW)).resolves.toBe(false);
    expect(scheduledJobRun.deleteMany).not.toHaveBeenCalled();
  });

  it('defaults to the current time', async () => {
    const { service, scheduledJobRun } = setup(1);

    await service.claim('feedback-window');

    const [{ data }] = scheduledJobRun.createMany.mock.calls[0] as [
      { data: { scheduledFor: Date }[] },
    ];
    expect(data[0].scheduledFor.getSeconds()).toBe(0);
  });
});
