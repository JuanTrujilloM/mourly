import Image from 'next/image';
import { Reveal } from '@/components/shared/Reveal';
import sello from '@/assets/brand/sello-verde.svg';

const REASONS = [
  {
    title: 'Un match por semana, con criterio',
    description:
      'Cada jueves nuestro sistema cruza lo que tienen en común, lo que buscan, cuándo pueden y cómo les fue en citas anteriores, y te propone una sola persona. Sin likes, sin deslizar.',
  },
  {
    title: 'Cita real, lugar real',
    description:
      'No se queda en el chat. Reservamos mesa en un lugar aliado cerca del campus.',
  },
  {
    title: 'Solo con carné',
    description:
      'Cada cuenta se valida con correo institucional. Parche cerrado, gente real.',
  },
];

export function WhySection() {
  return (
    <section className="border-line border-t px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal>
          <p className="label text-ink-3">Por qué Mourly</p>
          <h2 className="heading text-ink mt-3 text-4xl sm:text-5xl">
            No es otra app de citas.
          </h2>
          <p className="text-ink-2 mt-4 max-w-md text-lg">
            Somos la que de verdad te lleva a la cita.
          </p>
          <Image
            src={sello}
            alt="Sello: solo con carné, universidades privadas"
            width={160}
            height={160}
            className="mt-10"
          />
        </Reveal>

        <ul className="divide-line divide-y">
          {REASONS.map((reason, index) => (
            <li key={reason.title} className="py-7 first:pt-0 last:pb-0">
              <Reveal delay={index * 60}>
                <h3 className="subheading text-ink text-[22px]">
                  {reason.title}
                </h3>
                <p className="text-ink-2 mt-2 max-w-md leading-relaxed">
                  {reason.description}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
