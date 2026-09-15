import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCountdown } from './useCountdown';

function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => hidden,
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-14T12:00:00-05:00'));
  });

  afterEach(() => {
    setHidden(false);
    vi.useRealTimers();
  });

  it('ticks while the tab is visible', () => {
    const { result } = renderHook(() => useCountdown());
    const before = result.current.minutes;

    act(() => vi.advanceTimersByTime(60_000));

    expect(result.current.minutes).not.toBe(before);
  });

  it('stops ticking while hidden and refreshes on return', () => {
    const { result } = renderHook(() => useCountdown());
    act(() => setHidden(true));
    const whileHidden = result.current;

    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current).toBe(whileHidden);
    expect(vi.getTimerCount()).toBe(0);

    act(() => setHidden(false));
    expect(result.current.minutes).not.toBe(whileHidden.minutes);
  });
});
