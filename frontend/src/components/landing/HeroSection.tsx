import { ButtonLink } from '@/components/ui/Button';
import { MatchCountdown } from './MatchCountdown';
import { RotatingWords } from './RotatingWords';

const WITHOUT = [
  'scroll.',
  'perfiles falsos.',
  'chat de tres semanas.',
] as const;

// The headline is the first impression: the section fills the viewport and the
// countdown stays a quiet aside (beside it on desktop, under it on a phone).
export function HeroSection() {
  return (
    <section className="flex min-h-svh flex-col justify-center px-4 pt-28 pb-16 sm:px-6 sm:pt-36 sm:pb-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
        <div>
          <p className="label text-ink-3">
            Una cita real por semana · Solo con carné
          </p>

          <h1 className="display text-ink mt-5 text-[64px] sm:text-[104px] xl:text-[136px]">
            Esta semana hay <span className="text-accent-text">alguien</span>{' '}
            para vos.
          </h1>

          <p className="text-ink-2 mt-8 max-w-md text-lg">
            Una cita real por semana. Nosotros la organizamos.
          </p>
          {/* 22 px keeps the longest word on the "Sin" line at 320 px wide. */}
          <p className="subheading text-ink mt-2 text-[22px] min-[360px]:text-[26px] sm:text-[30px]">
            <RotatingWords prefix="Sin" words={WITHOUT} />
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/login" className="w-full sm:w-auto">
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

        <MatchCountdown className="w-full max-w-[324px] lg:w-[380px] lg:max-w-none" />
      </div>
    </section>
  );
}
