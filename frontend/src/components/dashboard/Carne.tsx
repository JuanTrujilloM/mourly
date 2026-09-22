import type { ReactNode } from 'react';

const MACHINE_LINE_LENGTH = 34;

// Passport-style line: upper case, no diacritics, fields joined and padded
// with "<". Decoration drawn from data already on the card, nothing new.
function machineLine(fields: string[]): string {
  const clean = (field: string) =>
    field
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '<');
  return fields
    .map(clean)
    .join('<<')
    .padEnd(MACHINE_LINE_LENGTH, '<')
    .slice(0, MACHINE_LINE_LENGTH);
}

const ROSETTE_TURNS = Array.from({ length: 24 }, (_, index) => index * 7.5);
const WAVE_ROWS = Array.from({ length: 11 }, (_, index) => 338 + index * 9);

const wavePath = (y: number) =>
  `M-6 ${y} Q 16 ${y - 9} 38 ${y}` +
  Array.from({ length: 8 }, (_, index) => ` T ${82 + index * 44} ${y}`).join('');

// Security-print background: a rosette and a band of waves in hologram ink.
function Guilloche() {
  return (
    <svg
      viewBox="0 0 350 430"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className="absolute inset-0 block h-full w-full"
    >
      <defs>
        <linearGradient id="carne-ink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-magenta-400)" />
          <stop offset="0.5" stopColor="var(--color-azul-400)" />
          <stop offset="1" stopColor="var(--color-cian-400)" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#carne-ink)" strokeWidth="0.7" opacity="0.55">
        {ROSETTE_TURNS.map((turn) => (
          <ellipse
            key={turn}
            cx="262"
            cy="118"
            rx="96"
            ry="34"
            transform={`rotate(${turn} 262 118)`}
          />
        ))}
        {WAVE_ROWS.map((y) => (
          <path key={y} d={wavePath(y)} />
        ))}
      </g>
    </svg>
  );
}

function CarneField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="label text-ink-3">{label}</dt>
      <dd className="text-ink mt-0.5 truncate text-[17px] font-semibold">
        {children}
      </dd>
    </div>
  );
}

export interface CarneData {
  name: string;
  age: number;
  university: string;
  major: string;
  biography?: string;
}

// The match as a credential: glass laminate, hologram seal, mono labels and
// two machine-readable lines. `photo` fills the portrait slot; `status` is the
// line under the fields.
export function Carne({
  data,
  photo,
  status,
}: {
  data: CarneData;
  photo: ReactNode;
  status: ReactNode;
}) {
  return (
    <article className="border-line bg-surface rounded-card shadow-elevated inset-shadow-glass relative overflow-hidden border">
      <Guilloche />
      <div aria-hidden className="holo-sheen absolute inset-0" />

      <div className="relative flex flex-col gap-3.5 p-[18px]">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="label text-ink">Carné de cita</p>
            <p className="label text-ink-3">Mourly · Medellín</p>
          </div>
          <div aria-hidden className="holo-ring h-[46px] w-[46px] rounded-full p-0.5">
            <div className="bg-medianoche/70 display text-blanco flex h-full w-full items-center justify-center rounded-full text-2xl">
              m
            </div>
          </div>
        </header>

        <div className="flex gap-4">
          <div className="border-line bg-surface-2 h-[170px] w-[132px] shrink-0 overflow-hidden rounded-xl border">
            {photo}
          </div>
          <dl className="flex min-w-0 flex-col gap-2.5">
            <div className="min-w-0">
              <dt className="label text-ink-3">Nombre</dt>
              <dd className="display text-blanco mt-0.5 truncate text-[32px] leading-none">
                {data.name}
              </dd>
            </div>
            <CarneField label="Edad">{data.age}</CarneField>
            <CarneField label="Universidad">{data.university}</CarneField>
            <CarneField label="Carrera">{data.major}</CarneField>
          </dl>
        </div>

        {status}

        {data.biography && (
          <>
            <div className="border-line border-t border-dashed" />
            <p className="human text-blanco text-[20px]">“{data.biography}”</p>
          </>
        )}

        <p
          aria-hidden
          className="text-ink-3 overflow-hidden font-mono text-[11.5px] leading-relaxed tracking-[0.1em] whitespace-nowrap"
        >
          {machineLine(['MOURLY', data.name, String(data.age)])}
          <br />
          {machineLine([data.university, data.major, 'MEDELLIN'])}
        </p>
      </div>

      <div
        aria-hidden
        className="border-accent-text text-accent-text absolute top-[284px] right-4 -rotate-[9deg] rounded-lg border-[1.5px] p-[3px] opacity-90"
      >
        <div className="border-accent-text flex flex-col items-center gap-0.5 rounded-[5px] border px-2 pt-1 pb-0.5">
          <span className="display text-[15px] leading-none">SOLO CON CARNÉ</span>
          <span className="font-mono text-[7.5px] tracking-[0.12em]">
            EAFIT · UPB · CES · EIA
          </span>
        </div>
      </div>
    </article>
  );
}
