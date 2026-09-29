import { Reveal } from '@/components/shared/Reveal';

// The objections the survey raised. Answers describe what we do, never a
// guarantee (legal/safety-legal). The 48 h mirrors the backend's
// RESPONSE_TIMEOUT_HOURS: a match with no date by then closes itself.
const QUESTIONS = [
  {
    question: '¿Puedo hablar antes con la persona?',
    answer:
      'Ves su perfil el jueves, y la cita es de una hora y de día. La conversación la dejamos para la mesa.',
  },
  {
    question: '¿Y si no me convence?',
    answer:
      'No marcás horarios y a las 48 horas el match se cierra solo. Esa semana no hay cita.',
  },
  {
    question: '¿Qué verifican?',
    answer:
      'Que tengás correo institucional de EAFIT, UPB, CES o EIA. No revisamos antecedentes: por eso la cita es en un lugar público, de día y de una hora.',
  },
];

// Plus that loses its vertical bar when the answer is open. No rotation: the
// brand allows no movement outside the weekly reveal.
function ToggleMark() {
  return (
    <span
      aria-hidden
      className="border-line text-ink relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
    >
      <span className="absolute h-[2px] w-3 rounded-full bg-current" />
      <span className="absolute h-3 w-[2px] rounded-full bg-current group-open:hidden" />
    </span>
  );
}

// Native <details>: keyboard and screen readers get the disclosure for free,
// and the answers stay in the page for search engines.
export function FaqSection() {
  return (
    <section
      id="preguntas"
      className="border-line border-t px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal>
          <p className="label text-ink-3">Preguntas frecuentes</p>
          <h2 className="heading text-ink mt-3 text-4xl sm:text-5xl">
            Lo que nos preguntan.
          </h2>
        </Reveal>

        <div className="divide-line border-line divide-y border-y">
          {QUESTIONS.map((item, index) => (
            <Reveal key={item.question} delay={index * 60}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 [&::-webkit-details-marker]:hidden">
                  <span className="subheading text-ink text-[20px] sm:text-[22px]">
                    {item.question}
                  </span>
                  <ToggleMark />
                </summary>
                <p className="text-ink-2 -mt-2 max-w-md pr-12 pb-6 leading-relaxed">
                  {item.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
