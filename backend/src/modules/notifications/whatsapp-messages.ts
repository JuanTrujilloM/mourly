import type { Notification } from './notification';

export function whatsappMessageFor(notification: Notification): string {
  switch (notification.kind) {
    case 'match_invite':
      return (
        `¡Tenemos tu match de la semana con ${notification.partner.name}! 🎉 ` +
        `Elige los lugares y tus horarios aquí: ${notification.availabilityUrl}`
      );
    case 'date_proposal':
      return (
        `¡Coincidieron con ${notification.partnerName}! 🎉 Su cita sería el ` +
        `${notification.whenText} en ${notification.venueName}. Está esperando confirmación.`
      );
    case 'more_availability':
      return (
        `Tus horarios no coincidieron con los de ${notification.partnerName} 😕. ` +
        `Agrega más franjas para intentarlo: ${notification.availabilityUrl}`
      );
    case 'feedback_request':
      return (
        `¿Cómo te fue con ${notification.partnerName} en ${notification.venueName}? ` +
        'Cuéntanos si se encontraron y qué tal estuvo 🙌'
      );
    case 'feedback_reminder':
      return (
        `Última oportunidad para contarnos de tu cita con ${notification.partnerName} ` +
        `en ${notification.venueName}. Después de esto cerramos la encuesta 😉`
      );
    case 'match_rejected':
      return (
        'Tu match de la semana no continuó 😞. Te buscaremos otro en el próximo ' +
        'ciclo. ¡No te desanimes!'
      );
    case 'rescheduling_failed':
      return (
        'No logramos coordinar una cita esta vez 😞. Te buscaremos otro match ' +
        'en el próximo ciclo. ¡No te desanimes!'
      );
  }
}
