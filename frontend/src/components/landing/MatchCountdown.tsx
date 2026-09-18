'use client';

import { useCountdown } from '@/hooks/useCountdown';
import { useIsClient } from '@/hooks/useIsClient';

const two = (n: number) => String(n).padStart(2, '0');

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

// Column centers in viewBox units. A tabular digit of the display face is 31
// wide at 76 px, so the columns sit 44 apart and the minutes end at x 243: the
// dot's home (globals.css, "Countdown") follows them as the full stop, the way
// it closes the wordmark.
const COLUMN_CENTERS = [15.5, 106, 212];

// The digits hold still (minute precision, no seconds): only the dot moves,
// with the loader's own lap. Drawn as one SVG so the orbit scales with it.
export function MatchCountdown({ className = '' }: { className?: string }) {
  const isClient = useIsClient();
  const { days, hours, minutes } = useCountdown();

  const columns = [
    { value: String(days), label: days === 1 ? 'día' : 'días' },
    { value: two(hours), label: hours === 1 ? 'hora' : 'horas' },
    { value: two(minutes), label: 'min' },
  ];

  // The landing is prerendered: the build's clock must not reach the page.
  const spoken = isClient
    ? `Faltan ${plural(days, 'día', 'días')}, ${plural(hours, 'hora', 'horas')} y ${plural(minutes, 'minuto', 'minutos')} para el próximo match`
    : 'Cuenta regresiva al próximo match, el jueves a las 7:00 pm';

  return (
    <div role="timer" aria-live="off" aria-label={spoken} className={className}>
      <svg
        viewBox="-30 -30 324 181"
        aria-hidden
        className="block h-auto w-full"
      >
        <text x="0" y="10" className="label fill-ink-3">
          Próximo match · jueves 7:00 pm
        </text>

        {columns.map((column, index) => (
          <g key={index} textAnchor="middle">
            <text
              x={COLUMN_CENTERS[index]}
              y="92"
              className={`display fill-ink text-[76px] tabular-nums transition-opacity ${
                isClient ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {column.value}
            </text>
            <text
              x={COLUMN_CENTERS[index]}
              y="118"
              className="label fill-ink-3"
            >
              {column.label}
            </text>
          </g>
        ))}

        <circle className="countdown-dot fill-accent" cx="0" cy="0" r="8" />
      </svg>
    </div>
  );
}
