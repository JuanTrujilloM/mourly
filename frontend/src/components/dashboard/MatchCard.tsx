import type { CurrentMatch, MatchPartner } from '@/types/match';

const STATUS: Record<string, { label: string; live: boolean }> = {
  pending: { label: 'Por confirmar', live: false },
  confirmed: { label: 'Cita confirmada', live: true },
  completed: { label: 'Cita hecha', live: false },
};

export function MatchCard({ match }: { match: CurrentMatch }) {
  const partner = match.partner as MatchPartner;
  const status = STATUS[match.status] ?? { label: match.status, live: false };

  return (
    <section className="bg-surface border-line rounded-card mt-8 border p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="label text-ink-3">Tu cita · esta semana</span>
        {status.live ? (
          <span className="text-live inline-flex items-center gap-1.5 text-[12.5px] font-semibold">
            <span aria-hidden className="bg-live h-[7px] w-[7px] rounded-full" />
            {status.label}
          </span>
        ) : (
          <span className="text-ink-3 text-[12.5px] font-semibold">
            {status.label}
          </span>
        )}
      </div>

      {partner.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={partner.photoUrl}
          alt=""
          className="mt-5 h-20 w-20 rounded-full object-cover"
        />
      )}

      <p className="human text-ink mt-4 text-[30px]">
        {partner.name}, {partner.age}
      </p>
      <p className="text-ink-2 mt-1 text-sm">
        {partner.major} · {partner.university}
      </p>

      {partner.biography && (
        <p className="human text-ink-2 mt-4 text-[18px]">
          “{partner.biography}”
        </p>
      )}

      <p className="text-ink-3 mt-5 text-sm">
        Te escribimos por WhatsApp para cuadrar día, hora y lugar.
      </p>
    </section>
  );
}
