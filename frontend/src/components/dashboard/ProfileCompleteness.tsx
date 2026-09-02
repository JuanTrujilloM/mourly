'use client';

import Link from 'next/link';
import { useMyProfile } from '@/hooks/useMyProfile';
import { useMyPreferences } from '@/hooks/useMyPreferences';
import { computeProfileCompleteness } from '@/lib/profileCompleteness';

export function ProfileCompleteness() {
  const { data: profile } = useMyProfile();
  const { data: preferences } = useMyPreferences();
  const { pct, hint } = computeProfileCompleteness(profile, preferences);

  return (
    <Link
      href="/perfil"
      className="glass-card mt-3.5 block p-4.5 transition hover:brightness-110"
    >
      <div className="flex items-center justify-between">
        <span className="text-cream text-sm font-semibold">Perfil completo</span>
        <span className="font-serif text-teal-soft text-lg font-semibold tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="from-teal to-coral h-full rounded-full bg-gradient-to-r shadow-[0_0_14px_rgba(57,198,221,0.5)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      {hint && <p className="text-slate mt-2.5 text-xs">{hint}</p>}
    </Link>
  );
}
