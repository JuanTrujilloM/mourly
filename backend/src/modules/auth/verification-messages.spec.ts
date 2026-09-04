import {
  INVALID_CODE_MESSAGE,
  TOO_MANY_ATTEMPTS_MESSAGE,
  messageForVerificationResult,
} from './verification-messages';

describe('messageForVerificationResult', () => {
  it('reports a lockout for too many attempts', () => {
    expect(messageForVerificationResult('too_many_attempts')).toBe(
      TOO_MANY_ATTEMPTS_MESSAGE,
    );
  });

  it('uses one indistinguishable message for every other failure', () => {
    for (const result of ['not_found', 'expired', 'mismatch'] as const) {
      expect(messageForVerificationResult(result)).toBe(INVALID_CODE_MESSAGE);
    }
  });
});
