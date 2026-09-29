import { Reveal } from '@/components/shared/Reveal';

// Figures from our own survey (141 students, September 2026), each tied to
// something the product already does. Social proof without testimonials or
// user counts we cannot back.
const FINDINGS = [
  {
    stat: '1 de cada 2',
    finding: 'prefiere un lugar que ya conoce.',
    answer: 'Tus citas son cerca de tu U.',
  },
  {
    stat: '1 de cada 3',
    finding: 'prefiere que sea de día.',
    answer: 'Horarios de 12:00 pm a 7:00 pm.',
  },
  {
    stat: '1 de cada 3',
    finding: 'iría si puede ver el perfil antes.',
    answer: 'El jueves ves su perfil.',
  },
];

export function SurveySection() {
  return (
    <section className="border-line border-t px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="label text-ink-3">Encuesta a estudiantes</p>
          <h2 className="heading text-ink mt-3 max-w-2xl text-4xl sm:text-5xl">
            Lo diseñamos con lo que nos dijeron.
          </h2>
        </Reveal>

        <ul className="mt-12 grid gap-10 sm:grid-cols-3 lg:gap-8">
          {FINDINGS.map((item, index) => (
            <li key={item.finding}>
              <Reveal delay={index * 60}>
                <div className="border-line border-t pt-6">
                  <p className="display text-accent-text text-[44px] tabular-nums">
                    {item.stat}
                  </p>
                  <p className="text-ink mt-3 text-lg">{item.finding}</p>
                  <p className="text-ink-2 mt-2">{item.answer}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        <p className="text-ink-3 mt-10 text-xs">
          Encuesta de Mourly a 141 estudiantes universitarios de Medellín,
          septiembre de 2026.
        </p>
      </div>
    </section>
  );
}
