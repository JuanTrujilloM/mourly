'use client';

import type { CurrentMatch } from '@/types/match';

// Active 'pending' match: show the partner so the user knows who it is. The
// accept/reject action lives only in the tokenized WhatsApp flow (no
// authenticated endpoint), so the CTA points there rather than deep-linking.
export function NewMatchHero({ match }: { match: CurrentMatch }) {
  const partner = match.partner;
  const score = match.compatibilityPercent;

  return (
    <section className="glass-card border-coral/25 relative overflow-hidden bg-gradient-to-br from-coral/[0.12] to-white/[0.03] p-6">
      <span className="border-coral/35 bg-coral/10 text-flame inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold">
        ✦ Nuevo match de la semana
      </span>

      {partner ? (
        <>
          <div className="mt-4.5 flex items-center gap-4">
            {partner.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={partner.photoUrl}
                alt={partner.name}
                className="h-[76px] w-[76px] flex-none rounded-[20px] border border-white/15 object-cover"
              />
            ) : (
              <div className="bg-navy-soft flex h-[76px] w-[76px] flex-none items-center justify-center rounded-[20px] border border-white/15 text-2xl">
                {partner.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-serif text-cream text-[1.4rem] leading-tight font-semibold">
                {partner.name}, {partner.age}
              </p>
              <p className="text-slate mt-1 text-xs">
                {partner.university} · {partner.major}
              </p>
              {partner.biography && (
                <p className="mt-2 text-xs leading-snug text-[#cdd9ea] italic">
                  “{partner.biography}”
                </p>
              )}
            </div>
          </div>

          <div className="text-slate mt-4.5 flex items-center gap-3 text-xs">
            <span>Compatibilidad</span>
            <span className="h-[9px] flex-1 overflow-hidden rounded-full bg-white/10">
              <span
                className="from-coral to-amber block h-full rounded-full bg-gradient-to-r"
                style={{ width: `${score}%` }}
              />
            </span>
            <span className="font-serif text-flame text-base font-semibold">
              {score}%
            </span>
          </div>
        </>
      ) : (
        <p className="text-slate mt-4 text-sm">
          Tu match de la semana ya está listo.
        </p>
      )}

      <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-4 text-center">
        <p className="text-cream text-sm font-bold">📲 Responde por WhatsApp</p>
        <p className="text-slate mt-1.5 text-xs leading-relaxed">
          Te enviamos un enlace para elegir lugar y horario. Tienes 24 h para
          responder.
        </p>
      </div>
    </section>
  );
}
