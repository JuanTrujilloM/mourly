'use client';

import { useCallback, useEffect, useState } from 'react';

export type RevealStep = 'dot' | 'card' | 'focus' | 'rest' | 'done';

// Approved on the proposal page on 2026-09-25: 1.45 s in all, never over 1.5.
export const REVEAL_MS = { dot: 350, card: 300, focus: 450, rest: 350 } as const;

const TIMED_STEPS = ['dot', 'card', 'focus', 'rest'] as const;
const NEXT_STEP: Record<(typeof TIMED_STEPS)[number], RevealStep> = {
  dot: 'card',
  card: 'focus',
  focus: 'rest',
  rest: 'done',
};

// The match link's one moment of movement. Off, it starts at the end.
export function useRevealSteps(enabled: boolean) {
  const [step, setStep] = useState<RevealStep>(enabled ? 'dot' : 'done');

  useEffect(() => {
    if (!enabled) return;
    let elapsed = 0;
    const timers = TIMED_STEPS.map((current) => {
      elapsed += REVEAL_MS[current];
      // A skip already reached the end; a late timer must not rewind it.
      return setTimeout(
        () => setStep((previous) => (previous === 'done' ? previous : NEXT_STEP[current])),
        elapsed,
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [enabled]);

  const skip = useCallback(() => setStep('done'), []);
  return { step, skip };
}
