import { Reveal } from '@/components/shared/Reveal';

const STEPS = [
  {
    title: 'Creá tu perfil',
    description:
      'Contanos quién sos, qué te gusta y qué buscás. Cinco minutos y listo.',
  },
  {
    title: 'El jueves te presentamos a alguien',
    description:
      'A las 7:00 pm te escribimos por WhatsApp con una sola persona, elegida por lo que tienen en común.',
  },
  {
    title: 'Cuadramos día, hora y lugar',
    description:
      'Marcás cuándo podés, elegís entre tres lugares aliados y nosotros reservamos.',
  },
  {
    title: 'Vas a la cita',
    description:
      'Un lugar real, una hora concreta, una persona con carné. Después te preguntamos cómo te fue.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="label text-ink-3">Cómo funciona</p>
          <h2 className="heading text-ink mt-3 max-w-2xl text-4xl sm:text-5xl">
            Cuatro pasos, una cita.
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Reveal delay={index * 60}>
                <div className="border-line border-t pt-6">
                  <span className="display text-ink block text-[56px] tabular-nums">
                    0{index + 1}
                  </span>
                  <h3 className="subheading text-ink mt-4 text-[22px]">
                    {step.title}
                  </h3>
                  <p className="text-ink-2 mt-2 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
