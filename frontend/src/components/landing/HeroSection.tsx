import { ButtonLink } from '@/components/ui/Button';
import { DateCard } from './DateCard';

export function HeroSection() {
  return (
    <section className="px-4 pt-28 pb-16 sm:px-6 sm:pt-36 sm:pb-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="label text-ink-3">Una cita real por semana · Solo con carné</p>

          <h1 className="display text-ink mt-5 text-[64px] sm:text-[88px]">
            Esta semana hay alguien para vos, mor.
          </h1>

          <p className="text-ink-2 mt-6 max-w-md text-lg">
            Una cita real por semana. Nosotros la organizamos. Sin scroll. Sin
            perfiles falsos. Sin chat de tres semanas.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/register" className="w-full sm:w-auto">
              Quiero mi cita
            </ButtonLink>
            <ButtonLink
              href="#como-funciona"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Cómo funciona
            </ButtonLink>
          </div>

          <p className="text-ink-3 mt-8 text-sm">
            Estudiantes verificados de EAFIT, UPB, CES y EIA ya pueden usar
            Mourly.
          </p>
        </div>

        <DateCard />
      </div>
    </section>
  );
}
