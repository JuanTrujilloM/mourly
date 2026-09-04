import type { VerificationResult } from './verification-code.service';

export const INVALID_CODE_MESSAGE = 'Invalid or expired verification code.';
export const TOO_MANY_ATTEMPTS_MESSAGE =
  'Too many attempts. Please request a new code.';

export function messageForVerificationResult(
  result: VerificationResult,
): string {
  return result === 'too_many_attempts'
    ? TOO_MANY_ATTEMPTS_MESSAGE
    : INVALID_CODE_MESSAGE;
}
