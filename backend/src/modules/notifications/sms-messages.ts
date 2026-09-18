import { toGsmText } from './gsm-text';
import type { Notification } from './notification';

const BRAND_PREFIX = 'Mourly:';

export function smsMessageFor(notification: Notification): string {
  switch (notification.kind) {
    case 'match_invite':
      return (
        `${BRAND_PREFIX} tenés match esta semana con ` +
        `${toGsmText(notification.partner.name)}. ` +
        `Escogé lugares y horarios: ${notification.availabilityUrl}`
      );
    case 'date_proposal':
      return (
        `${BRAND_PREFIX} coincidieron con ${toGsmText(notification.partnerName)}. ` +
        `Cita confirmada: ${toGsmText(notification.whenText)} en ` +
        `${toGsmText(notification.venueName)}. ¡Que la disfruten!`
      );
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
