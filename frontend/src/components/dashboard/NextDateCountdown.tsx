'use client';

import { BlurredFigures } from '@/components/shared/BlurredFigures';
import { useCountdown } from '@/hooks/useCountdown';
import { Carne } from './Carne';

const two = (n: number) => String(n).padStart(2, '0');

// Filler for the carné behind the countdown. It is only ever seen blurred: the
// real one arrives on Thursday.
const SEALED_CARNE = {
  name: 'Tu match',
  age: 21,
  university: 'Tu u',
  major: 'Se revela el jueves',
  biography: 'Esta semana hay alguien para vos.',
};

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
    <section className="relative mt-6">
      <div aria-hidden className="pointer-events-none blur-[7px] select-none">
        <Carne
          data={SEALED_CARNE}
          photo={<BlurredFigures className="h-full w-full" />}
          status={<p className="label text-accent-text">Por revelar</p>}
        />
      </div>

      <div className="bg-medianoche/55 rounded-card absolute inset-0 flex flex-col justify-between p-6">
        <div>
          <p className="label text-ink-2">Tu próxima cita</p>
          <p className="subheading text-ink mt-2 text-[22px]">Jueves, 7:00 pm</p>
        </div>

        <div
          role="timer"
          aria-live="off"
          aria-label={`Faltan ${days} días, ${hours} horas y ${minutes} minutos`}
          className="grid grid-cols-3 gap-2.5"
        >
          {blocks.map((block) => (
            <div
              key={block.label}
              className="border-line bg-surface inset-shadow-glass rounded-[20px] border py-4 text-center backdrop-blur-md"
            >
              <span className="display text-blanco block text-[48px] tabular-nums">
                {block.value}
              </span>
              <span className="label text-ink-2 mt-1.5 block">{block.label}</span>
            </div>
          ))}
        </div>

        <p className="text-ink-2 text-sm">
          Ahí te presentamos a alguien por SMS. Mantené la búsqueda activa.
        </p>
      </div>
    </section>
  );
}
