import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RESEND_COOLDOWN_SECONDS } from '@/lib/constants/auth';
import {
  rememberResendCooldown,
  remainingResendCooldown,
} from './resend-cooldown';

const EMAIL = 'ana@eafit.edu.co';

describe('resend cooldown storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('reports no wait when nothing was ever sent', () => {
    expect(remainingResendCooldown(EMAIL)).toBe(0);
  });

  it('reports the full cooldown right after a code is sent', () => {
    rememberResendCooldown(EMAIL);

    expect(remainingResendCooldown(EMAIL)).toBe(RESEND_COOLDOWN_SECONDS);
  });

  it('reports what is left of the cooldown, not the whole of it', () => {
    vi.useFakeTimers();
    rememberResendCooldown(EMAIL);

    vi.advanceTimersByTime(45_000);

    expect(remainingResendCooldown(EMAIL)).toBe(15);
  });

  it('reports no wait once the deadline has passed', () => {
    vi.useFakeTimers();
    rememberResendCooldown(EMAIL);

    vi.advanceTimersByTime(RESEND_COOLDOWN_SECONDS * 1000 + 1000);

    expect(remainingResendCooldown(EMAIL)).toBe(0);
  });

  it('keeps one deadline per account', () => {
    rememberResendCooldown(EMAIL);

    expect(remainingResendCooldown('otra@eafit.edu.co')).toBe(0);
  });

  it('ignores the case and spacing the address was typed with', () => {
    rememberResendCooldown('  Ana@EAFIT.edu.co ');

    expect(remainingResendCooldown(EMAIL)).toBe(RESEND_COOLDOWN_SECONDS);
  });

  describe('when the browser blocks storage', () => {
    beforeEach(() => {
      vi.stubGlobal('sessionStorage', {
        getItem: () => {
          throw new Error('blocked');
        },
        setItem: () => {
          throw new Error('blocked');
        },
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('assumes a fresh cooldown instead of inviting a rejected request', () => {
      expect(remainingResendCooldown(EMAIL)).toBe(RESEND_COOLDOWN_SECONDS);
    });

    it('still lets the caller record a send', () => {
      expect(() => rememberResendCooldown(EMAIL)).not.toThrow();
    });
  });
});
