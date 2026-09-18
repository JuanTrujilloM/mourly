import type { VerificationResult } from './verification-code.service';

export const INVALID_CODE_MESSAGE =
  'El código es incorrecto o expiró. Pedí uno nuevo.';
export const TOO_MANY_ATTEMPTS_MESSAGE =
  'Demasiados intentos. Pedí un código nuevo.';

export function messageForVerificationResult(
  result: VerificationResult,
): string {
  return result === 'too_many_attempts'
    ? TOO_MANY_ATTEMPTS_MESSAGE
    : INVALID_CODE_MESSAGE;
}
