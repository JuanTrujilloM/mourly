'use client';

import { useEffect, useState } from 'react';
import {
  countdownParts,
  nextMatchMoment,
  type CountdownParts,
} from '@/lib/utils/next-match-moment';

// Minute precision on screen, so a 15 s tick keeps it honest without churn.
const TICK_MS = 15_000;

export function useCountdown(): CountdownParts {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let intervalId: number | undefined;
    const tick = () => setNow(new Date());

    // A hidden tab has nothing to repaint; resync on return so the value is fresh.
    const syncWithVisibility = () => {
      window.clearInterval(intervalId);
      intervalId = undefined;
      if (document.hidden) return;
      tick();
      intervalId = window.setInterval(tick, TICK_MS);
    };

    syncWithVisibility();
    document.addEventListener('visibilitychange', syncWithVisibility);
    return () => {
      document.removeEventListener('visibilitychange', syncWithVisibility);
      window.clearInterval(intervalId);
    };
  }, []);

  return countdownParts(now, nextMatchMoment(now));
}
