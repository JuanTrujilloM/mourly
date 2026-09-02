'use client';

import { FeedbackForm } from '@/components/dashboard/FeedbackForm';
import type { PendingFeedback } from '@/types/feedback';

// Highest-priority hero (HU-10): a past date is waiting on this user's feedback.
export function FeedbackHero({ pending }: { pending: PendingFeedback }) {
  const who = pending.partnerName ?? 'tu match';

  return (
    <section className="glass-card border-blush/25 relative overflow-hidden bg-gradient-to-br from-blush/[0.12] to-white/[0.03] p-6">
      <span className="border-blush/40 bg-blush/15 text-blush inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold">
        ♥ Cuéntanos
      </span>
      <h1 className="font-serif text-cream mt-4 text-2xl leading-tight font-semibold">
        ¿Cómo te fue con {who}?
      </h1>
      <p className="text-slate mt-2 text-sm">
        Tu respuesta mejora tus próximos matches.
      </p>
      <FeedbackForm pending={pending} />
    </section>
  );
}
