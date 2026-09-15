import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EMAIL_CODE_TTL_SECONDS, MAX_RESENDS } from '@/lib/constants/auth';
import { hasSpentResends, recordResend } from './resend-allowance';

const EMAIL = 'ana@eafit.edu.co';

function recordTimes(times: number, email = EMAIL) {
  for (let index = 0; index < times; index += 1) recordResend(email);
}

describe('resend allowance storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('has allowance left when nothing was resent', () => {
    expect(hasSpentResends(EMAIL)).toBe(false);
  });

  it('keeps allowance until the last permitted resend', () => {
    recordTimes(MAX_RESENDS - 1);

    expect(hasSpentResends(EMAIL)).toBe(false);
  });

  it('is spent after the maximum number of resends', () => {
    recordTimes(MAX_RESENDS);

    expect(hasSpentResends(EMAIL)).toBe(true);
  });

  it('counts per email, ignoring case', () => {
    recordTimes(MAX_RESENDS, 'ANA@eafit.edu.co');

    expect(hasSpentResends(EMAIL)).toBe(true);
    expect(hasSpentResends('otra@eafit.edu.co')).toBe(false);
  });

  it('starts over once the last code would have expired', () => {
    vi.useFakeTimers();
    recordTimes(MAX_RESENDS);

    vi.advanceTimersByTime(EMAIL_CODE_TTL_SECONDS * 1000);

    expect(hasSpentResends(EMAIL)).toBe(false);
  });

  it('treats unreadable storage as allowance left', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(hasSpentResends(EMAIL)).toBe(false);
  });
});
