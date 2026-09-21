import { Logo } from '@/components/shared/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { dateBoardFor } from '@/lib/utils/date-board';
import type { DateView } from '@/types/date-view';
import { DepartureBoard } from './DepartureBoard';
import { LinesDiagram } from './LinesDiagram';

const firstName = (name: string) => name.trim().split(/\s+/)[0];

const lineOf = (university: string | null) =>
  university ? `Línea ${university}` : 'Tu línea';

function PartnerPhoto({ partner }: { partner: DateView['partner'] }) {
  if (partner.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={partner.photoUrl}
        alt=""
        className="border-accent h-[52px] w-[52px] shrink-0 rounded-full border-[3px] object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="border-accent bg-surface-2 display text-ink-2 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-[3px] text-2xl"
    >
      {partner.name.charAt(0)}
    </span>
  );
}

// The confirmed date as a station: a departure board with the facts, then two
// lines (the viewer's and the partner's) meeting at the venue. Read-only.
export function DateStation({ view }: { view: DateView }) {
  const { partner, venue, viewer, sharedHobbies } = view;
  const board = dateBoardFor(view.scheduledAt);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Logo />
        <span className="border-line bg-surface text-live inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[12.5px] font-semibold">
          <span aria-hidden className="bg-live h-[7px] w-[7px] rounded-full" />
          Cita confirmada
        </span>
      </div>

      <h1 className="heading text-ink mt-2 text-[34px]">
        Tu cita con {firstName(partner.name)}
      </h1>

      <DepartureBoard
        rows={[
          { label: 'Destino', value: venue.name },
          { label: 'Día', value: board.day },
          { label: 'Hora', value: board.time },
          { label: 'Estado', value: 'Confirmada', live: true },
        ]}
      />

      <LinesDiagram
        viewerLine={lineOf(viewer.university)}
        partnerName={firstName(partner.name)}
        partnerLine={lineOf(partner.university)}
        sharedHobbies={sharedHobbies}
        venueName={venue.name}
        whenText={`${board.day} · ${board.time}`}
      />

      <section className="border-line bg-surface rounded-card inset-shadow-glass space-y-3 border p-5">
        <div className="flex items-center gap-3">
          <PartnerPhoto partner={partner} />
          <div className="min-w-0">
            <p className="display text-blanco truncate text-[26px] leading-none">
              {partner.name}, {partner.age}
            </p>
            <p className="text-ink-2 mt-1 truncate text-sm">
              {partner.major} · {partner.university}
            </p>
          </div>
        </div>
        {partner.biography && (
          <p className="human text-ink text-[18px]">“{partner.biography}”</p>
        )}
      </section>

      <section className="border-line bg-surface rounded-card inset-shadow-glass border p-5">
        <p className="label text-ink-3">Dirección</p>
        <p className="text-ink mt-1.5 text-[15px] font-semibold">{venue.name}</p>
        <p className="text-ink-2 text-sm">{venue.address}</p>
      </section>

      <ButtonLink href="/dashboard" variant="secondary" className="w-full">
        Abrir Mourly
      </ButtonLink>
    </div>
  );
}
