'use client';

import { useMemo } from 'react';
import { Countdown } from '@/components/dashboard/Countdown';
import { nextMatchDrop } from '@/lib/nextMatchDrop';

// Default state: no active match. The countdown to the Thursday 7pm drop is the
// anchor that makes the weekly cadence feel alive.
export function SearchingHero() {
  const target = useMemo(() => nextMatchDrop(), []);

  return (
    <section className="glass-card p-6">
      <span className="border-teal/35 bg-teal/10 text-teal-soft inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold">
        <span className="bg-teal-soft animate-pulse-glow h-2 w-2 rounded-full" />
        Buscando cita
      </span>
      <h1 className="font-serif text-cream mt-4 text-[2rem] leading-[1.05] font-semibold">
        Tu match llega <em className="text-accent italic">el jueves</em>
      </h1>
      <p className="text-slate mt-2 text-sm leading-relaxed">
        Cada jueves a las 7:00 pm la IA elige una sola persona para ti.
      </p>
      <Countdown target={target} />
    </section>
  );
}
