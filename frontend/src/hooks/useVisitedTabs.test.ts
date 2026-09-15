import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useVisitedTabs } from './useVisitedTabs';

describe('useVisitedTabs', () => {
  it('starts with only the tab the user landed on', () => {
    const { result } = renderHook(() => useVisitedTabs(1));

    expect([...result.current]).toEqual([1]);
  });

  it('remembers every tab once visited', () => {
    const { result, rerender } = renderHook(
      ({ active }) => useVisitedTabs(active),
      { initialProps: { active: 0 } },
    );

    rerender({ active: 2 });
    rerender({ active: 0 });

    expect([...result.current].sort()).toEqual([0, 2]);
  });
});
