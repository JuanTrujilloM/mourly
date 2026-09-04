'use client';

import { useState } from 'react';
import { useCurrentMatch } from '@/hooks/useCurrentMatch';
import type { CurrentMatch } from '@/types/match';
import { MatchCard } from './MatchCard';
import { MatchReveal } from './MatchReveal';

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

export function MatchSection() {
  const { data: match, isLoading } = useCurrentMatch();

  if (isLoading) {
    return <p className="text-ink-3 mt-8 text-sm">Buscando tu cita...</p>;
  }

  if (!match || !match.partner) return <NoMatchYet />;

  // Keyed by match so a new match re-runs the initializer and its reveal.
  return <MatchWithReveal key={match.id} match={match} />;
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

function NoMatchYet() {
  return (
    <section className="bg-surface border-line rounded-card mt-8 border p-6">
      <p className="label text-ink-3">Tu cita · esta semana</p>
      <p className="subheading text-ink mt-3 text-[22px]">
        Todavía no tenés cita esta semana.
      </p>
      <p className="text-ink-2 mt-2 text-sm">
        El jueves a las 7:00 pm te presentamos a alguien por WhatsApp.
      </p>
    </section>
  );
}
