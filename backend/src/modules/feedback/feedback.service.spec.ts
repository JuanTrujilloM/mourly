import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { FeedbackService } from './feedback.service';

const PAST_DATE = {
  id: 'd1',
  scheduledAt: new Date('2026-07-01T20:00:00Z'),
};

function setup(overrides: { date?: unknown; existing?: unknown } = {}) {
  const dateFindFirst = jest
    .fn()
    .mockResolvedValue(
      overrides.date === undefined ? PAST_DATE : overrides.date,
    );
  const dateUpdate = jest.fn().mockResolvedValue({});
  const feedbackFindUnique = jest
    .fn()
    .mockResolvedValue(overrides.existing ?? null);
  const feedbackCreate = jest.fn().mockResolvedValue({ id: 'f1' });
  const feedbackCount = jest.fn().mockResolvedValue(1);

  const prisma = {
    date: { findFirst: dateFindFirst, update: dateUpdate },
    feedback: {
      findUnique: feedbackFindUnique,
      create: feedbackCreate,
      count: feedbackCount,
    },
  } as unknown as PrismaService;

  return {
    service: new FeedbackService(prisma),
    dateFindFirst,
    dateUpdate,
    feedbackCreate,
    feedbackCount,
  };
}

describe('FeedbackService', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-02T20:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('scopes the lookup to a date the user took part in', async () => {
    const { service, dateFindFirst } = setup();

    await service.submit('u1', 'd1', { occurred: true, rating: 5 });

    expect(dateFindFirst.mock.calls[0][0].where).toMatchObject({
      id: 'd1',
      match: { OR: [{ userAId: 'u1' }, { userBId: 'u1' }] },
    });
  });

  it('hides a date that belongs to someone else behind a 404', async () => {
    const { service } = setup({ date: null });

    await expect(
      service.submit('intruder', 'd1', { occurred: true, rating: 5 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('refuses to rate a date that has not happened yet', async () => {
    const { service } = setup({
      date: { id: 'd1', scheduledAt: new Date('2026-07-10T20:00:00Z') },
    });

    await expect(
      service.submit('u1', 'd1', { occurred: true, rating: 5 }),
    ).rejects.toThrow(/once it has happened/);
  });

  it('refuses a second answer from the same user', async () => {
    const { service } = setup({ existing: { id: 'f0' } });

    await expect(
      service.submit('u1', 'd1', { occurred: true, rating: 5 }),
    ).rejects.toThrow(ConflictException);
  });

  it('stores the answer with its optional fields', async () => {
    const { service, feedbackCreate } = setup();

    await service.submit('u1', 'd1', {
      occurred: true,
      rating: 4,
      comments: 'Muy bien',
      amountSpent: 40000,
    });

    expect(feedbackCreate.mock.calls[0][0].data).toEqual({
      dateId: 'd1',
      userId: 'u1',
      occurred: true,
      rating: 4,
      comments: 'Muy bien',
      noShowReason: null,
      amountSpent: 40000,
    });
  });

  it('leaves the date open while only one user has answered', async () => {
    const { service, dateUpdate } = setup();

    await service.submit('u1', 'd1', { occurred: true, rating: 5 });

    expect(dateUpdate).not.toHaveBeenCalled();
  });

  it('completes the date once both users answered', async () => {
    const { service, dateUpdate, feedbackCount } = setup();
    feedbackCount.mockResolvedValue(2);

    await service.submit('u1', 'd1', { occurred: true, rating: 5 });

    expect(dateUpdate).toHaveBeenCalledWith({
      where: { id: 'd1' },
      data: { status: 'completed' },
    });
  });

  it('records a no-show with its reason', async () => {
    const { service, feedbackCreate } = setup();

    await service.submit('u1', 'd1', {
      occurred: false,
      noShowReason: 'No pudo asistir',
    });

    expect(feedbackCreate.mock.calls[0][0].data).toMatchObject({
      occurred: false,
      rating: null,
      noShowReason: 'No pudo asistir',
    });
  });
});
