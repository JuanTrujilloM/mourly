import { NotificationsService } from '../notifications/notifications.service';
import { DateAnnouncerService } from './date-announcer.service';
import { DateLinkService } from './date-link.service';
import { completedMatch } from './match-confirmation.test-helpers';

const SLOT = {
  scheduledAt: new Date('2026-07-10T20:00:00Z'),
  label: 'vie 10 jul · 15:00',
};
const VENUE = { name: 'Pergamino', address: 'Cra 37' };

function setup() {
  const notifications = { send: jest.fn().mockResolvedValue(undefined) };
  const dateLinks = {
    urlFor: jest
      .fn()
      .mockImplementation((_matchId: string, userId: string) =>
        Promise.resolve(`https://www.mourly.com/cita/token-${userId}`),
      ),
  };
  const service = new DateAnnouncerService(
    notifications as unknown as NotificationsService,
    dateLinks as unknown as DateLinkService,
  );
  return { service, notifications, dateLinks };
}

const sentField = (
  notifications: ReturnType<typeof setup>['notifications'],
  field: 'partnerName' | 'dateUrl',
) =>
  notifications.send.mock.calls.map(
    (call: [Record<string, string | null>]) => call[0][field],
  );

describe('DateAnnouncerService', () => {
  it('notifies both users with their partner name', async () => {
    const { service, notifications } = setup();

    await service.announce(completedMatch(), SLOT, VENUE);

    expect(sentField(notifications, 'partnerName').sort()).toEqual([
      'Ana',
      'Beto',
    ]);
  });

  it('sends each user their own link to the date page', async () => {
    const { service, notifications, dateLinks } = setup();

    await service.announce(completedMatch(), SLOT, VENUE);

    expect(sentField(notifications, 'dateUrl').sort()).toEqual([
      'https://www.mourly.com/cita/token-a',
      'https://www.mourly.com/cita/token-b',
    ]);
    expect(dateLinks.urlFor).toHaveBeenCalledWith('m1', 'a', SLOT.scheduledAt);
  });

  it('still announces the date when a link cannot be issued', async () => {
    const { service, notifications, dateLinks } = setup();
    dateLinks.urlFor.mockResolvedValue(null);

    await service.announce(completedMatch(), SLOT, VENUE);

    expect(notifications.send).toHaveBeenCalledTimes(2);
    expect(sentField(notifications, 'dateUrl')).toEqual([null, null]);
  });
});
