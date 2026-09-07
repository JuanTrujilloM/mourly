import type { VerificationResult } from './verification-code.service';

export const INVALID_CODE_MESSAGE =
  'El código es incorrecto o expiró. Si todavía no tenés cuenta, registrate primero.';
export const TOO_MANY_ATTEMPTS_MESSAGE =
  'Demasiados intentos. Pedí un código nuevo.';
export const RESEND_LIMIT_MESSAGE =
  'Alcanzaste el máximo de reenvíos. Esperá unos minutos y volvé a intentarlo.';

export function cooldownMessage(secondsLeft: number): string {
  return `Esperá ${secondsLeft}s antes de pedir otro código.`;
}

export function messageForVerificationResult(
  result: VerificationResult,
): string {
  return result === 'too_many_attempts'
    ? TOO_MANY_ATTEMPTS_MESSAGE
    : INVALID_CODE_MESSAGE;
}
