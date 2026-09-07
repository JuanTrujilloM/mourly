import { Reveal } from '@/components/shared/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { COMPANY, FOUNDERS } from '@/lib/constants/company';

const founderNames = FOUNDERS.map((founder) => founder.shortName).join(' y ');

// The corporate facts stay below the fold; the landing keeps selling the date.
export function AboutSection() {
  return (
    <section className="border-line border-t px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="label text-ink-3">Hecho en Medellín</p>
          <h2 className="heading text-ink mt-3 max-w-2xl text-4xl sm:text-5xl">
            Mourly la hacemos nosotros.
          </h2>
          <p className="text-ink-2 mt-4 max-w-2xl text-lg">
            Somos una startup de tecnología con sede en Medellín, fundada en{' '}
            {COMPANY.foundedYear} por {founderNames}. El producto, el matching
            y la tecnología los construimos nosotros. No es un proyecto de
            clase ni depende de ninguna universidad.
          </p>
          <ButtonLink href="/about" variant="secondary" className="mt-8">
            Sobre Mourly
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
