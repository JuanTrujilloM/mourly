import { UNKNOWN_PARTNER_NAME } from './partner-summary';
import { smsMessageFor } from './sms-messages';
import {
  ALL_NOTIFICATIONS,
  DATE_URL,
  INVITE_URL,
  NUDGE_URL,
  PARTNER,
  notificationOf,
} from './test-helpers';

const GSM7_ALPHABET =
  /^[A-Za-z0-9 @£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà^{}\\[~\]|€\n\r]*$/;
const SINGLE_SEGMENT = 160;
const EVERY_KIND = ALL_NOTIFICATIONS.map((item) => item.kind).sort();

describe('smsMessageFor', () => {
  it('has a fixture for every notification kind', () => {
    expect(EVERY_KIND).toEqual(
      [
        'date_proposal',
        'feedback_reminder',
        'feedback_request',
        'match_invite',
        'match_rejected',
        'more_availability',
        'rescheduling_failed',
      ].sort(),
    );
  });

  it.each(ALL_NOTIFICATIONS)('fits $kind in one GSM-7 segment', (item) => {
    const message = smsMessageFor(item);

    expect(message.length).toBeLessThanOrEqual(SINGLE_SEGMENT);
    expect(message).toMatch(GSM7_ALPHABET);
  });

  it.each(ALL_NOTIFICATIONS)('opens $kind with the brand', (item) => {
    expect(smsMessageFor(item).startsWith('Mourly:')).toBe(true);
  });

  it('keeps the invite link verbatim', () => {
    expect(smsMessageFor(notificationOf('match_invite'))).toContain(INVITE_URL);
  });

  it('keeps the nudge link verbatim', () => {
    expect(smsMessageFor(notificationOf('more_availability'))).toContain(
      NUDGE_URL,
    );
  });

  it('announces the date as confirmed with sanitized details', () => {
    const message = smsMessageFor(notificationOf('date_proposal'));

    expect(message).toContain('confirmada');
    expect(message).toContain('Sofia Gomez');
    expect(message).toContain('sab 12 sep - 15:00');
    expect(message).toContain('Café Velvet');
  });

  it('keeps the date link verbatim', () => {
    expect(smsMessageFor(notificationOf('date_proposal'))).toContain(DATE_URL);
  });

  it('still fits the confirmation with a long name and venue', () => {
    const message = smsMessageFor({
      ...notificationOf('date_proposal'),
      partnerName: 'Mateo Jaramillo',
      whenText: 'mar 22 sep · 12:00',
      venueName: 'Crepes & Waffles Las Vegas',
    });

    expect(message.length).toBeLessThanOrEqual(SINGLE_SEGMENT);
    expect(message).toMatch(GSM7_ALPHABET);
  });

  it('announces the date without a link when none could be issued', () => {
    const message = smsMessageFor({
      ...notificationOf('date_proposal'),
      dateUrl: null,
    });

    expect(message).toContain('Cita confirmada: sab 12 sep - 15:00');
    expect(message).not.toContain('http');
    expect(message.length).toBeLessThanOrEqual(SINGLE_SEGMENT);
  });

  it('invites to meet the partner by first name and university', () => {
    const message = smsMessageFor(notificationOf('match_invite'));

    expect(message).toBe(
      `Mourly: esta semana hay alguien para vos. Conocé a Sofia, de CES: ${INVITE_URL}`,
    );
  });

  it('leaves the university out when it is unknown', () => {
    const message = smsMessageFor({
      ...notificationOf('match_invite'),
      partner: { ...PARTNER, university: null },
    });

    expect(message).toContain(`Conocé a Sofia: ${INVITE_URL}`);
  });

  it('keeps "tu match" whole when the partner has no profile', () => {
    const message = smsMessageFor({
      ...notificationOf('match_invite'),
      partner: { ...PARTNER, name: UNKNOWN_PARTNER_NAME, university: null },
    });

    expect(message).toContain(`Conocé a tu match: ${INVITE_URL}`);
  });

  it('still fits the invite with a long first name and university', () => {
    const message = smsMessageFor({
      ...notificationOf('match_invite'),
      partner: {
        ...PARTNER,
        name: 'Maximiliano Andrés Restrepo',
        university: 'Javeriana de Cali',
      },
    });

    expect(message.length).toBeLessThanOrEqual(SINGLE_SEGMENT);
    expect(message).toMatch(GSM7_ALPHABET);
    expect(message).not.toContain('Restrepo');
  });

  it('still fits the reminder with a long name and venue', () => {
    const message = smsMessageFor({
      ...notificationOf('feedback_reminder'),
      partnerName: 'Maria Alejandra',
      venueName: 'Crepes & Waffles Las Vegas',
    });

    expect(message.length).toBeLessThanOrEqual(SINGLE_SEGMENT);
  });
});
