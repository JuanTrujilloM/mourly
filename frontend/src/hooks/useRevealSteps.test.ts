import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { REVEAL_MS, useRevealSteps } from './useRevealSteps';

describe('useRevealSteps', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the whole reveal at 1.5 s or less', () => {
    const total = Object.values(REVEAL_MS).reduce((sum, ms) => sum + ms, 0);

    expect(total).toBeLessThanOrEqual(1500);
  });

  it('starts done when the reveal is off', () => {
    const { result } = renderHook(() => useRevealSteps(false));

    expect(result.current.step).toBe('done');
  });

  it('walks dot, card, focus and rest, then ends', () => {
    const { result } = renderHook(() => useRevealSteps(true));
    expect(result.current.step).toBe('dot');

    act(() => vi.advanceTimersByTime(REVEAL_MS.dot));
    expect(result.current.step).toBe('card');

    act(() => vi.advanceTimersByTime(REVEAL_MS.card));
    expect(result.current.step).toBe('focus');

    act(() => vi.advanceTimersByTime(REVEAL_MS.focus));
    expect(result.current.step).toBe('rest');

    act(() => vi.advanceTimersByTime(REVEAL_MS.rest));
    expect(result.current.step).toBe('done');
  });

  it('jumps to the end on skip and never goes back', () => {
    const { result } = renderHook(() => useRevealSteps(true));

    act(() => result.current.skip());
    act(() => vi.advanceTimersByTime(2000));

    expect(result.current.step).toBe('done');
  });
});
