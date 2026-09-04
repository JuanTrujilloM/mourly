import { emailLayout, escapeHtml } from './email-layout';

export interface FeedbackEmailData {
  recipientName: string;
  partnerName: string;
  venueName: string;
  isReminder: boolean;
}

export function feedbackEmail(data: FeedbackEmailData): {
  subject: string;
  html: string;
} {
  const subject = data.isReminder
    ? `Última oportunidad: cuéntanos de tu cita con ${data.partnerName}`
    : `¿Cómo te fue con ${data.partnerName}?`;

  const intro = data.isReminder
    ? 'Todavía no nos contaste cómo te fue, y es la última vez que te preguntamos.'
    : 'Queremos saber cómo estuvo.';

  return {
    subject,
    html: emailLayout(`
      <h2 style="margin: 0 0 12px; font-size: 22px;">Hey ${escapeHtml(data.recipientName)},</h2>
      <p style="margin: 0 0 12px; font-size: 15px;">
        ${intro} Tu cita con <strong>${escapeHtml(data.partnerName)}</strong>
        en <strong>${escapeHtml(data.venueName)}</strong> ya pasó.
      </p>
      <p style="margin: 0; font-size: 15px;">
        Cuéntanos si se encontraron y qué tal estuvo. Tu respuesta nos ayuda a
        elegir mejor tu próximo match.
      </p>
    `),
  };
}
