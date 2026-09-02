import { PrismaService } from '../../config/prisma.service';
import { AdminStatsService } from './admin-stats.service';

function setup(overrides: Record<string, unknown> = {}) {
  const userCount = jest.fn().mockResolvedValue(40);
  const profileCount = jest.fn().mockResolvedValue(30);
  const matchCount = jest.fn().mockResolvedValue(5);

  const prisma = {
    user: { count: userCount },
    profile: {
      count: profileCount,
      groupBy: jest.fn().mockResolvedValue([
        { university: 'EAFIT', _count: { university: 18 } },
        { university: 'CES', _count: { university: 12 } },
      ]),
    },
    match: {
      count: matchCount,
      groupBy: jest.fn().mockResolvedValue([
        { status: 'pending', _count: { status: 3 } },
        { status: 'confirmed', _count: { status: 2 } },
        { status: 'expired', _count: { status: 5 } },
      ]),
    },
    date: {
      groupBy: jest.fn().mockResolvedValue([
        { status: 'accepted', _count: { status: 1 } },
        { status: 'completed', _count: { status: 1 } },
      ]),
    },
    feedback: { count: jest.fn().mockResolvedValue(2) },
    ...overrides,
  } as unknown as PrismaService;

  return { service: new AdminStatsService(prisma), userCount };
}

describe('AdminStatsService', () => {
  it('breaks users down by university', async () => {
    const { service } = setup();

    expect((await service.get()).users.byUniversity).toEqual([
      { university: 'EAFIT', count: 18 },
      { university: 'CES', count: 12 },
    ]);
  });

  it('reports verified and onboarded counts alongside the total', async () => {
    const { service } = setup();

    expect((await service.get()).users).toMatchObject({
      total: 40,
      verified: 40,
      onboarded: 30,
    });
  });

  it('sums every match status into the total', async () => {
    const { service } = setup();

    expect((await service.get()).matches.total).toBe(10);
  });

  it('exposes the match statuses as a map', async () => {
    const { service } = setup();

    expect((await service.get()).matches.byStatus).toEqual({
      pending: 3,
      confirmed: 2,
      expired: 5,
    });
  });

  it('computes the match to date conversion', async () => {
    const { service } = setup();

    expect((await service.get()).dates.matchToDateRate).toBe(0.2);
  });

  it('reports a zero conversion instead of dividing by zero', async () => {
    const { service } = setup({
      match: {
        count: jest.fn().mockResolvedValue(0),
        groupBy: jest.fn().mockResolvedValue([]),
      },
    });

    expect((await service.get()).dates.matchToDateRate).toBe(0);
  });

  it('counts only the feedback that says the date happened', async () => {
    const { service } = setup();

    expect((await service.get()).dates.attendedFeedback).toBe(2);
  });
});
