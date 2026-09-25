'use client';

import { BlurredFigures } from '@/components/shared/BlurredFigures';
import { useCountdown } from '@/hooks/useCountdown';
import { useIsClient } from '@/hooks/useIsClient';

const two = (n: number) => String(n).padStart(2, '0');

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

// Column centers in the card's 340 x 360 box. A tabular digit of the display
// face is 31 wide at 76 px, so the columns sit 44 apart and the minutes end at
// x 281: the dot's home (globals.css, "Countdown") follows them as the full
// stop, the way it closes the wordmark, and from there it laps the card.
const COLUMN_CENTERS = [53.5, 144, 250];

// A glass card over two blurred figures: who they are shows on Thursday. The
// digits hold still (minute precision, no seconds); only the dot moves, along
// the card's own border. The SVG shares the card's box so the orbit path and
// the CSS border coincide at any width.
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
    <div
      role="timer"
      aria-live="off"
      aria-label={spoken}
      className={`countdown-card border-line shadow-elevated relative border ${className}`}
    >
      <div className="clip-rounded absolute inset-0 rounded-[inherit]">
        <BlurredFigures couple className="absolute -inset-8 h-[calc(100%+4rem)] w-[calc(100%+4rem)]" />
        <div className="from-medianoche/25 to-medianoche/80 absolute inset-0 bg-linear-to-b" />
      </div>

      <svg
        viewBox="0 0 340 360"
        aria-hidden
        className="relative block h-full w-full overflow-visible"
      >
        <text x="28" y="46" className="label fill-ink">
          Próximo match · jueves 7:00 pm
        </text>

        {columns.map((column, index) => (
          <g key={index} textAnchor="middle">
            <text
              x={COLUMN_CENTERS[index]}
              y="242"
              className={`display fill-ink text-[76px] tabular-nums transition-opacity ${
                isClient ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {column.value}
            </text>
            <text
              x={COLUMN_CENTERS[index]}
              y="268"
              className="label fill-ink-2"
            >
              {column.label}
            </text>
          </g>
        ))}

        <text x="28" y="326" className="subheading fill-ink text-[20px]">
          El jueves ves quién es.
        </text>

        <circle className="countdown-dot fill-accent" cx="0" cy="0" r="8" />
      </svg>
    </div>
  );
}
