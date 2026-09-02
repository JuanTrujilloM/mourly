import { Logger } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { FeedbackWindowService } from './feedback-window.service';
import { PendingDateRepository } from './pending-date.repository';

function pendingDate(id: string, answeredBy: string[] = []) {
  return {
    id,
    venue: { name: 'Pergamino' },
    feedbacks: answeredBy.map((userId) => ({ userId })),
    match: {
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
    },
  };
}

function setup(
  awaitingRequest: unknown[] = [],
  awaitingReminder: unknown[] = [],
) {
  const dates = {
    findAwaitingRequest: jest.fn().mockResolvedValue(awaitingRequest),
    findAwaitingReminder: jest.fn().mockResolvedValue(awaitingReminder),
    markRequested: jest.fn().mockResolvedValue({}),
    markReminded: jest.fn().mockResolvedValue({ count: 0 }),
    closeExpired: jest.fn().mockResolvedValue(0),
  };
  const notifications = { send: jest.fn().mockResolvedValue(undefined) };

  const service = new FeedbackWindowService(
    dates as unknown as PendingDateRepository,
    notifications as unknown as NotificationsService,
  );
  return { service, dates, notifications };
}

const NOW = new Date('2026-07-10T12:00:00Z');

describe('FeedbackWindowService', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('requestPending', () => {
    it('asks both participants and stamps the date', async () => {
      const { service, dates, notifications } = setup([pendingDate('d1')]);

      expect(await service.requestPending(NOW)).toBe(1);
      expect(notifications.send).toHaveBeenCalledTimes(2);
      expect(dates.markRequested).toHaveBeenCalledWith('d1', NOW);
    });

    it('does nothing when no date is due', async () => {
      const { service, notifications } = setup([]);

      expect(await service.requestPending(NOW)).toBe(0);
      expect(notifications.send).not.toHaveBeenCalled();
    });

    it('stamps the date even when the send fails, so it is not retried forever', async () => {
      const { service, dates, notifications } = setup([pendingDate('d1')]);
      notifications.send.mockRejectedValue(new Error('smtp down'));

      await service.requestPending(NOW);

      expect(dates.markRequested).toHaveBeenCalledWith('d1', NOW);
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe('remindPending', () => {
    it('reminds only the participant who has not answered', async () => {
      const { service, notifications } = setup([], [pendingDate('d1', ['a'])]);

      expect(await service.remindPending(NOW)).toBe(1);
      expect(notifications.send).toHaveBeenCalledTimes(1);
      expect(notifications.send.mock.calls[0][0]).toMatchObject({
        kind: 'feedback_reminder',
        recipient: { email: 'b@ces.edu.co' },
      });
    });

    it('sends no reminder once both answered but still stamps the date', async () => {
      const { service, dates, notifications } = setup(
        [],
        [pendingDate('d1', ['a', 'b'])],
      );

      expect(await service.remindPending(NOW)).toBe(0);
      expect(notifications.send).not.toHaveBeenCalled();
      expect(dates.markReminded).toHaveBeenCalledWith(['d1'], NOW);
    });

    it('skips the stamp when nothing was due', async () => {
      const { service, dates } = setup([], []);

      await service.remindPending(NOW);

      expect(dates.markReminded).not.toHaveBeenCalled();
    });
  });

  describe('runFeedbackCycle', () => {
    it('walks request, reminder and close in order', async () => {
      const { service, dates } = setup();

      await service.runFeedbackCycle();

      expect(dates.findAwaitingRequest).toHaveBeenCalled();
      expect(dates.findAwaitingReminder).toHaveBeenCalled();
      expect(dates.closeExpired).toHaveBeenCalled();
    });
  });
});
