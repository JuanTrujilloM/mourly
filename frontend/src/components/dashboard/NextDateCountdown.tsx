'use client';

import { useCountdown } from '@/hooks/useCountdown';

const two = (n: number) => String(n).padStart(2, '0');

// Days, hours and minutes only: a clock that ticks by the second reads as
// anxiety, and the brand keeps counters still.
export function NextDateCountdown() {
  const { days, hours, minutes } = useCountdown();
  const blocks = [
    { value: String(days), label: days === 1 ? 'día' : 'días' },
    { value: two(hours), label: 'horas' },
    { value: two(minutes), label: 'min' },
  ];

  return (
    <section className="bg-surface border-line rounded-card mt-8 border p-6">
      <p className="label text-ink-3">Tu próxima cita</p>
      <p className="subheading text-ink mt-2 text-[22px]">Jueves, 7:00 pm</p>

      <div
        role="timer"
        aria-live="off"
        aria-label={`Faltan ${days} días, ${hours} horas y ${minutes} minutos`}
        className="divide-line mt-5 grid grid-cols-3 divide-x"
      >
        {blocks.map((block) => (
          <div key={block.label} className="px-2 text-center">
            <span className="display text-ink block text-[56px] tabular-nums">
              {block.value}
            </span>
            <span className="label text-ink-3 mt-1 block">{block.label}</span>
          </div>
        ))}
      </div>

      <p className="text-ink-2 mt-5 text-sm">
        Ahí te presentamos a alguien por WhatsApp. Mantené la búsqueda activa.
      </p>
    </section>
  );
}
