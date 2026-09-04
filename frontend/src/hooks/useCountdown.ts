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
    const id = window.setInterval(() => setNow(new Date()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  return countdownParts(now, nextMatchMoment(now));
}
