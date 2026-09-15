import { decideResend } from './verification-resend-policy';

const NOW = Date.parse('2026-09-14T12:00:00Z');

function latestCode(overrides: Record<string, unknown> = {}) {
  return {
    resendCount: 0,
    createdAt: new Date(NOW - 120_000),
    expiresAt: new Date(NOW + 480_000),
    ...overrides,
  };
}

describe('decideResend', () => {
  it('allows the first code of a cycle without counting it as a resend', () => {
    expect(decideResend(null, NOW)).toEqual({ allowed: true, resendCount: 0 });
  });

  it('blocks a code requested inside the cooldown', () => {
    const fresh = latestCode({ createdAt: new Date(NOW - 59_000) });

    expect(decideResend(fresh, NOW)).toEqual({ allowed: false });
  });

  it('counts up once the cooldown has passed', () => {
    const settled = latestCode({ resendCount: 1 });

    expect(decideResend(settled, NOW)).toEqual({
      allowed: true,
      resendCount: 2,
    });
  });

  it('allows the third resend', () => {
    const settled = latestCode({ resendCount: 2 });

    expect(decideResend(settled, NOW)).toEqual({
      allowed: true,
      resendCount: 3,
    });
  });

  it('blocks a fourth resend in the same cycle', () => {
    expect(decideResend(latestCode({ resendCount: 3 }), NOW)).toEqual({
      allowed: false,
    });
  });

  it('starts a new cycle once the latest code expired', () => {
    const expired = latestCode({
      resendCount: 3,
      createdAt: new Date(NOW - 5_000),
      expiresAt: new Date(NOW),
    });

    expect(decideResend(expired, NOW)).toEqual({
      allowed: true,
      resendCount: 0,
    });
  });
});
