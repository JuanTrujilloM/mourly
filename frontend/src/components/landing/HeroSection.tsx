import { ButtonLink } from '@/components/ui/Button';
import { MatchCountdown } from './MatchCountdown';
import { RotatingWords } from './RotatingWords';

const WITHOUT = [
  'scroll.',
  'perfiles falsos.',
  'chats eternos.',
] as const;

// The headline is the first impression: the section fills the viewport and the
// countdown card sits beside it on desktop, under it on a phone. On a phone
// the card has to show in the first screen, even inside Instagram's in-app
// browser (~660 px tall): tighter spacing, a smaller card, and the secondary
// button and the universities line wait for sm (the strip below repeats it).
export function HeroSection() {
  return (
    <section className="flex min-h-svh flex-col justify-center px-4 pt-20 pb-16 sm:px-6 sm:pt-36 sm:pb-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
        <div>
          <h1 className="display text-ink text-[64px] sm:text-[104px] xl:text-[128px]">
            Un parche real{' '}
            <span className="text-accent-text">cada semana.</span>
          </h1>

          <p className="text-ink-2 mt-3 max-w-md text-base sm:mt-8 sm:text-lg">
            Esta semana hay alguien para vos. Nosotros cuadramos un café de una
            hora, de día, cerca de tu U.
          </p>
          {/* 22 px keeps the longest word on the "Sin" line at 320 px wide. */}
          <p className="subheading text-ink mt-2 text-[22px] min-[360px]:text-[26px] sm:text-[30px]">
            <RotatingWords prefix="Sin" words={WITHOUT} />
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <ButtonLink href="/login" className="w-full sm:w-auto">
              Crear mi perfil
            </ButtonLink>
            <div className="hidden sm:block">
              <ButtonLink href="#como-funciona" variant="secondary">
                Cómo funciona
              </ButtonLink>
            </div>
          </div>

          <p className="text-ink-3 mt-8 hidden text-sm sm:block">
            Estudiantes verificados de EAFIT, UPB, CES y EIA ya pueden usar
            Mourly.
          </p>
        </div>

        <MatchCountdown className="mx-auto w-full max-w-[300px] sm:mt-6 sm:max-w-[340px] lg:mt-0 lg:w-[380px] lg:max-w-none" />
      </div>
    </section>
  );
}
