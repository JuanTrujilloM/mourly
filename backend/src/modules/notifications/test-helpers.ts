import type {
  Notification,
  NotificationKind,
  PartnerSummary,
  Recipient,
} from './notification';

const TOKEN = 't'.repeat(43);

export const RECIPIENT: Recipient = {
  name: 'Ana',
  email: 'ana@eafit.edu.co',
  cellphone: '+573001112233',
};

export const PARTNER: PartnerSummary = {
  name: 'Sofía Gómez',
  age: 24,
  university: 'CES',
  major: 'Medicina',
  photoUrl: 'https://cdn/b.jpg',
};

export const INVITE_URL = `https://mourly.com/flow/${TOKEN}/places`;
export const NUDGE_URL = `https://mourly.com/availability/${TOKEN}`;
// Date links carry a 128-bit token: 22 characters.
export const DATE_URL = `https://mourly.com/cita/${'d'.repeat(22)}`;

export const ALL_NOTIFICATIONS: Notification[] = [
  {
    kind: 'match_invite',
    recipient: RECIPIENT,
    partner: PARTNER,
    availabilityUrl: INVITE_URL,
    expiresInDays: 3,
  },
  {
    kind: 'date_proposal',
    recipient: RECIPIENT,
    partnerName: PARTNER.name,
    whenText: 'sáb 12 sep · 15:00',
    venueName: 'Café Velvet',
    venueAddress: 'Cra 37 #8A-46',
    dateUrl: DATE_URL,
  },
  {
    kind: 'more_availability',
    recipient: RECIPIENT,
    partnerName: PARTNER.name,
    availabilityUrl: NUDGE_URL,
  },
  {
    kind: 'feedback_request',
    recipient: RECIPIENT,
    partnerName: PARTNER.name,
    venueName: 'Café Velvet',
  },
  {
    kind: 'feedback_reminder',
    recipient: RECIPIENT,
    partnerName: PARTNER.name,
    venueName: 'Café Velvet',
  },
  { kind: 'match_rejected', recipient: RECIPIENT },
  { kind: 'rescheduling_failed', recipient: RECIPIENT },
];

export function notificationOf<K extends NotificationKind>(
  kind: K,
): Extract<Notification, { kind: K }> {
  return ALL_NOTIFICATIONS.find((item) => item.kind === kind) as Extract<
    Notification,
    { kind: K }
  >;
}
