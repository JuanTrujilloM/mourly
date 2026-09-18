import type { EmailMessage } from '../email-message';
import { emailFooterText, emailLayout } from './email-layout';

interface VerificationCodeEmailInput {
  code: string;
  ttlMinutes: number;
}

const HEADING = 'Tu código de ingreso';
const IGNORE_LINE =
  'Si no lo pediste, ignorá este correo. Nadie puede entrar sin este código.';

function subjectFor(code: string): string {
  return `${code} es tu código de ingreso a Mourly`;
}

function instructionsFor(ttlMinutes: number): string {
  return `Usalo para entrar a Mourly. Vence en ${ttlMinutes} minutos.`;
}

export function verificationCodeEmail({
  code,
  ttlMinutes,
}: VerificationCodeEmailInput): Required<EmailMessage> {
  return {
    subject: subjectFor(code),
    html: emailLayout(`
      <h2 style="margin: 0 0 12px; font-size: 22px;">${HEADING}</h2>
      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5;">${instructionsFor(ttlMinutes)}</p>
      <p style="margin: 0 0 20px; font-size: 36px; font-weight: 700; letter-spacing: 8px; text-align: center;">${code}</p>
      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${IGNORE_LINE}</p>
    `),
    text: [
      `${HEADING}: ${code}`,
      instructionsFor(ttlMinutes),
      IGNORE_LINE,
      '',
      emailFooterText(),
    ].join('\n'),
  };
}
