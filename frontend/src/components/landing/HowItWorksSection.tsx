import { Reveal } from '@/components/shared/Reveal';

const STEPS = [
  {
    title: 'Creá tu perfil',
    description:
      'Contanos quién sos, qué te gusta y qué buscás. Cinco minutos y listo.',
  },
  {
    title: 'El jueves ves quién es',
    description:
      'A las 7:00 pm te avisamos. Entrás y ves su perfil y qué tienen en común.',
  },
  {
    title: 'Un café de una hora, de día',
    description:
      'Marcás cuándo podés entre 12:00 pm y 7:00 pm, elegís entre tres lugares cerca de tu U y nosotros reservamos.',
  },
  {
    title: 'Vas a la cita',
    description:
      'En un lugar que ya conocés, con alguien de tu U. Después te preguntamos cómo te fue.',
  },
];

// Stations share the date page's metro language (cita/LinesDiagram): white
// ring on the night fill, the venue as a terminal with the magenta dot.
function Station({ terminal }: { terminal: boolean }) {
  if (terminal) {
    return (
      <span
        aria-hidden
        className="bg-medianoche border-blanco absolute top-[-4px] left-[-4px] z-10 flex h-8 w-8 items-center justify-center rounded-full border-[5px]"
      >
        <span className="bg-accent h-[10px] w-[10px] rounded-full" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="bg-medianoche border-blanco absolute top-0 left-0 z-10 h-6 w-6 rounded-full border-[3.5px]"
    />
  );
}

// The track runs from a station's center to the next one's across the list
// gap: 40 px + 12 px stacked on a phone, 32 px + 12 px side by side on lg.
function Track() {
  return (
    <span
      aria-hidden
      className="bg-accent absolute top-3 left-2 -bottom-[52px] w-2 rounded-full lg:top-2 lg:-right-[44px] lg:bottom-auto lg:left-3 lg:h-2 lg:w-auto"
    />
  );
}

// The deeper band on the landing: the four steps drawn as one metro line that
// ends at the date.
export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="noche bg-page px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="label text-ink-3">Cómo funciona</p>
          <h2 className="heading text-ink mt-3 max-w-2xl text-4xl sm:text-5xl">
            Cuatro pasos, una cita.
          </h2>
        </Reveal>

        <ol className="mt-14 grid gap-10 lg:grid-cols-4 lg:gap-8">
          {STEPS.map((step, index) => {
            const terminal = index === STEPS.length - 1;
            return (
              <li key={step.title} className="relative pl-12 lg:pt-14 lg:pl-0">
                {!terminal && <Track />}
                <Station terminal={terminal} />
                <Reveal delay={index * 60}>
                  <p className="label text-accent-text">
                    {terminal ? 'Destino' : `Estación 0${index + 1}`}
                  </p>
                  <h3 className="subheading text-ink mt-2 text-[22px]">
                    {step.title}
                  </h3>
                  <p className="text-ink-2 mt-2 max-w-xs text-sm leading-relaxed">
                    {step.description}
                  </p>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
