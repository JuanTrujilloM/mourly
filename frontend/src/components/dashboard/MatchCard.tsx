import type { CurrentMatch, MatchPartner } from '@/types/match';
import { Carne } from './Carne';

const STATUS: Record<string, { label: string; live: boolean }> = {
  pending: { label: 'Por confirmar', live: false },
  confirmed: { label: 'Plan confirmado', live: true },
  completed: { label: 'Plan hecho', live: false },
};

function Portrait({ partner }: { partner: MatchPartner }) {
  if (partner.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={partner.photoUrl} alt="" className="h-full w-full object-cover" />
    );
  }
  return (
    <div
      aria-hidden
      className="display text-ink-3 flex h-full w-full items-center justify-center text-[64px]"
    >
      {partner.name.charAt(0)}
    </div>
  );
}

export function MatchCard({ match }: { match: CurrentMatch }) {
  const partner = match.partner as MatchPartner;
  const status = STATUS[match.status] ?? { label: match.status, live: false };

  return (
    <section className="mt-6">
      <p className="label text-ink-3 mb-3">Tu plan · esta semana</p>

      <Carne
        data={partner}
        photo={<Portrait partner={partner} />}
        status={
          <p
            className={`label flex items-center gap-2 ${
              status.live ? 'text-live' : 'text-accent-text'
            }`}
          >
            <span
              aria-hidden
              className={`h-[7px] w-[7px] rounded-full ${
                status.live ? 'bg-live' : 'bg-accent'
              }`}
            />
            {status.label}
          </p>
        }
      />

      <p className="bg-papel text-medianoche mt-4 inline-block -rotate-1 rounded-[3px] px-3.5 py-2.5 font-mono text-xs leading-relaxed shadow-elevated">
        Te escribimos por SMS para cuadrar día, hora y lugar.
      </p>
    </section>
  );
}
