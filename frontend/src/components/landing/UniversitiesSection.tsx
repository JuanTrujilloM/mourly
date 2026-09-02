import { Reveal } from '@/components/shared/Reveal';

const UNIVERSITIES = [
  'EAFIT',
  'UPB',
  'U. de los Andes',
  'U. Javeriana',
  'U. del Rosario',
  'CES',
  'EIA',
  'Externado',
];

export function UniversitiesSection() {
  const row = [...UNIVERSITIES, ...UNIVERSITIES];

  return (
    <section className="py-16 sm:py-20">
      <Reveal className="px-4 text-center sm:px-6">
        <p className="text-slate text-sm font-medium tracking-widest uppercase">
          Comunidad verificada en
        </p>
      </Reveal>

      <div className="group relative mt-8 overflow-hidden">
        <div className="from-navy-deep absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r to-transparent sm:w-28" />
        <div className="from-navy-deep absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l to-transparent sm:w-28" />

        <div className="animate-marquee flex w-max gap-4 group-hover:[animation-play-state:paused]">
          {row.map((name, index) => (
            <span
              key={`${name}-${index}`}
              className="border-white/10 bg-navy-soft text-cream hover:border-cyan/40 hover:text-cyan shrink-0 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
