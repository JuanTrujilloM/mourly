'use client';

import { useState } from 'react';
import { useCurrentMatch } from '@/hooks/useCurrentMatch';
import {
  AVAILABILITY_STATUS,
  type AvailabilityStatus,
} from '@/lib/constants/profile';
import type { CurrentMatch } from '@/types/match';
import { MatchCard } from './MatchCard';
import { MatchReveal } from './MatchReveal';
import { NextDateCountdown } from './NextDateCountdown';
import { PausedCard } from './PausedCard';

// The reveal plays once per match; the flag lives in the browser because
// the API has no "seen" state yet.
const revealKey = (matchId: string) => `mourly.reveal.${matchId}`;

function wasRevealed(matchId: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(revealKey(matchId)) === '1';
  } catch {
    return true;
  }
}

function markRevealed(matchId: string): void {
  try {
    window.localStorage.setItem(revealKey(matchId), '1');
  } catch {
    // Private mode: the reveal simply plays again next time.
  }
}

// With a match: the card (and its one-time reveal). Without one: the
// countdown to Thursday 7:00 pm, or the pause card when the search is off.
export function MatchSection({ status }: { status: AvailabilityStatus }) {
  const { data: match, isLoading } = useCurrentMatch();

  if (isLoading) {
    return <p className="text-ink-3 mt-8 text-sm">Buscando tu cita...</p>;
  }

  if (match?.partner) {
    // Keyed by match so a new match re-runs the initializer and its reveal.
    return <MatchWithReveal key={match.id} match={match} />;
  }

  if (status === AVAILABILITY_STATUS.PAUSED) return <PausedCard />;

  return <NextDateCountdown />;
}

function MatchWithReveal({ match }: { match: CurrentMatch }) {
  const [revealing, setRevealing] = useState(() => !wasRevealed(match.id));

  const finishReveal = () => {
    markRevealed(match.id);
    setRevealing(false);
  };

  return (
    <>
      <MatchCard match={match} />
      {revealing && <MatchReveal match={match} onDone={finishReveal} />}
    </>
  );
}
