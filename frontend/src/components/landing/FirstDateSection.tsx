import { DepartureBoard } from '@/components/cita/DepartureBoard';
import { Reveal } from '@/components/shared/Reveal';

// Process, never outcome (legal/safety-legal): each point is something the
// product already does, not a promise that the date goes well.
const POINTS = [
  {
    title: 'De día y cortica.',
    description:
      'Horarios de 12:00 pm a 7:00 pm, de una hora. Un café, no una noche.',
  },
  {
    title: 'En un lugar que ya conocés.',
    description: 'Cerca de tu U, a lugares a los que ya vas.',
  },
];

// The same board the confirmed-date page shows. No venue name and no calendar
// date: a named venue reads as a partnership, a fixed date goes stale.
const SAMPLE_BOARD = [
  { label: 'Destino', value: 'Cerca de tu U' },
  { label: 'Día', value: 'Martes' },
  { label: 'Hora', value: '4:00 p. m.' },
  { label: 'Estado', value: 'Confirmada', live: true },
];

// Right after the night band, so it answers the fear the steps leave open:
// meeting a stranger. The bottom rule separates it from WhySection, which
// shares the same lit ground.
export function FirstDateSection() {
  return (
    <section className="border-line border-b px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="label text-ink-3">Tu primera cita</p>
            <h2 className="heading text-ink mt-3 max-w-2xl text-4xl sm:text-5xl">
              Sabés con quién, dónde y a qué hora.
            </h2>
          </Reveal>

          <ul className="mt-10 grid gap-8">
            {POINTS.map((point, index) => (
              <li key={point.title}>
                <Reveal delay={index * 60}>
                  <div className="border-line border-t pt-6">
                    <h3 className="subheading text-ink text-[22px]">
                      {point.title}
                    </h3>
                    <p className="text-ink-2 mt-2 max-w-md leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={120} className="w-full max-w-[360px] justify-self-center lg:justify-self-end">
          <p className="label text-ink-3 mb-3">Así llega tu cita confirmada</p>
          <DepartureBoard rows={SAMPLE_BOARD} />
        </Reveal>
      </div>
    </section>
  );
}
