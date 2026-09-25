import { firstName } from '../../common/utils/first-name';
import { toGsmText } from './gsm-text';
import { UNKNOWN_PARTNER_NAME } from './partner-summary';
import type { Notification } from './notification';

const BRAND_PREFIX = 'Mourly:';

// With the link the copy is cut to the facts so both still fit one segment;
// "Mirala" carries no accent on purpose (á is outside GSM-7).
function dateConfirmedMessage(
  notification: Extract<Notification, { kind: 'date_proposal' }>,
): string {
  const partner = toGsmText(notification.partnerName);
  const when = toGsmText(notification.whenText);
  const venue = toGsmText(notification.venueName);

  if (!notification.dateUrl) {
    return (
      `${BRAND_PREFIX} coincidieron con ${partner}. ` +
      `Cita confirmada: ${when} en ${venue}. ¡Que la disfruten!`
    );
  }
  return (
    `${BRAND_PREFIX} cita confirmada con ${partner}: ${when} en ${venue}. ` +
    `Mirala: ${notification.dateUrl}`
  );
}

// The link opens the partner's profile, so the SMS only has to make them
// someone: first name and university, never the surname. "Conocé" keeps its
// accent: é is inside GSM-7.
function matchInviteMessage(
  notification: Extract<Notification, { kind: 'match_invite' }>,
): string {
  const { partner } = notification;
  const name =
    partner.name === UNKNOWN_PARTNER_NAME
      ? partner.name
      : toGsmText(firstName(partner.name));
  const from = partner.university
    ? `, de ${toGsmText(partner.university)}`
    : '';
  return (
    `${BRAND_PREFIX} esta semana hay alguien para vos. ` +
    `Conocé a ${name}${from}: ${notification.availabilityUrl}`
  );
}

export function smsMessageFor(notification: Notification): string {
  switch (notification.kind) {
    case 'match_invite':
      return matchInviteMessage(notification);
    case 'date_proposal':
      return dateConfirmedMessage(notification);
    case 'more_availability':
      return (
        `${BRAND_PREFIX} tus horarios no cuadraron con ` +
        `${toGsmText(notification.partnerName)}. ` +
        `Podés sumar franjas: ${notification.availabilityUrl}`
      );
    case 'feedback_request':
      return (
        `${BRAND_PREFIX} ¿te encontraste con ${toGsmText(notification.partnerName)} ` +
        `en ${toGsmText(notification.venueName)}? Contanos qué tal estuvo.`
      );
    case 'feedback_reminder':
      return (
        `${BRAND_PREFIX} no nos contaste de tu cita con ` +
        `${toGsmText(notification.partnerName)} en ` +
        `${toGsmText(notification.venueName)}. ` +
        'Después de esto cerramos la encuesta: ¿qué tal estuvo?'
      );
    case 'match_rejected':
      return (
        `${BRAND_PREFIX} tu match de esta semana no sigue adelante. ` +
        'Te buscamos otro la semana que viene. ¡No te desanimes!'
      );
    case 'rescheduling_failed':
      return (
        `${BRAND_PREFIX} no logramos cuadrar una cita esta vez. ` +
        'Te buscamos otro match la semana que viene. ¡No te desanimes!'
      );
  }
}
