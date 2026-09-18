import type { VerificationResult } from './verification-code.service';
import { TOO_MANY_ATTEMPTS_MESSAGE } from './verification-messages';

export const CELLPHONE_TAKEN_MESSAGE =
  'Ese celular ya está registrado en otra cuenta.';
export const CELLPHONE_REQUIRED_MESSAGE = 'Primero registrá tu celular.';
export const ALREADY_VERIFIED_MESSAGE = 'Tu celular ya está verificado.';
export const TOO_MANY_CODES_MESSAGE =
  'Pediste demasiados códigos. Esperá unos minutos y volvé a intentarlo.';
export const DAILY_LIMIT_MESSAGE =
  'Llegaste al límite de códigos por SMS de hoy. Probá de nuevo mañana.';
export const SMS_SENT_MESSAGE = 'Te enviamos un código por SMS.';
export const INVALID_PHONE_CODE_MESSAGE =
  'El código es incorrecto o expiró. Pedí uno nuevo.';

export function phoneCodeSms(code: string, ttlMinutes: number): string {
  return `Mourly: ${code} es tu código de verificación. Vence en ${ttlMinutes} minutos.`;
}

export function messageForPhoneResult(result: VerificationResult): string {
  return result === 'too_many_attempts'
    ? TOO_MANY_ATTEMPTS_MESSAGE
    : INVALID_PHONE_CODE_MESSAGE;
}
