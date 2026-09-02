import { emailContentFor } from './email-content';
import { whatsappMessageFor } from './whatsapp-messages';
import type { Notification, NotificationKind } from './notification';

const RECIPIENT = {
  name: 'Ana',
  email: 'ana@eafit.edu.co',
  cellphone: '+573001112233',
};

const PARTNER = {
  name: 'Beto',
  age: 24,
  university: 'CES',
  major: 'Medicina',
  photoUrl: 'https://cdn/b.jpg',
};

const ALL_NOTIFICATIONS: Notification[] = [
  {
    kind: 'match_invite',
    recipient: RECIPIENT,
    partner: PARTNER,
    availabilityUrl: 'https://app.test/flow/t/places',
    expiresInDays: 3,
  },
  {
    kind: 'date_proposal',
    recipient: RECIPIENT,
    partnerName: 'Beto',
    whenText: 'vie 10 jul · 15:00',
    venueName: 'Pergamino',
    venueAddress: 'Cra 37',
  },
  {
    kind: 'more_availability',
    recipient: RECIPIENT,
    partnerName: 'Beto',
    availabilityUrl: 'https://app.test/availability/t',
  },
  { kind: 'match_rejected', recipient: RECIPIENT },
  { kind: 'rescheduling_failed', recipient: RECIPIENT },
];

const EVERY_KIND: NotificationKind[] = [
  'match_invite',
  'date_proposal',
  'more_availability',
  'match_rejected',
  'rescheduling_failed',
];

describe('notification content', () => {
  it('covers every notification kind in the fixtures', () => {
    expect(ALL_NOTIFICATIONS.map((item) => item.kind).sort()).toEqual(
      [...EVERY_KIND].sort(),
    );
  });

  describe('emailContentFor', () => {
    it.each(ALL_NOTIFICATIONS)(
      'builds a subject and html for $kind',
      (notification) => {
        const content = emailContentFor(notification);

        expect(content.subject.length).toBeGreaterThan(0);
        expect(content.html).toContain('<');
      },
    );

    it('puts the availability link in the invite email', () => {
      const content = emailContentFor(ALL_NOTIFICATIONS[0]);

      expect(content.html).toContain('https://app.test/flow/t/places');
    });

    it('puts the venue address in the date proposal email', () => {
      const content = emailContentFor(ALL_NOTIFICATIONS[1]);

      expect(content.html).toContain('Cra 37');
    });
  });

  describe('whatsappMessageFor', () => {
    it.each(ALL_NOTIFICATIONS)('builds a message for $kind', (notification) => {
      expect(whatsappMessageFor(notification).length).toBeGreaterThan(0);
    });

    it('includes the flow link in the invite message', () => {
      expect(whatsappMessageFor(ALL_NOTIFICATIONS[0])).toContain(
        'https://app.test/flow/t/places',
      );
    });

    it('names the partner and venue in the proposal message', () => {
      const message = whatsappMessageFor(ALL_NOTIFICATIONS[1]);

      expect(message).toContain('Beto');
      expect(message).toContain('Pergamino');
    });

    it('includes the nudge link when availability did not overlap', () => {
      expect(whatsappMessageFor(ALL_NOTIFICATIONS[2])).toContain(
        'https://app.test/availability/t',
      );
    });
  });
});
