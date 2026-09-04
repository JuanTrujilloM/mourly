const MARQUESINA = 'EAFIT · UPB · CES · EIA';

// A printed strip, not a marquee: the brand allows no movement here.
export function UniversitiesSection() {
  return (
    <section
      aria-label="Universidades de lanzamiento"
      className="border-line overflow-hidden border-y py-5"
    >
      <div className="flex justify-center gap-12 whitespace-nowrap">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            aria-hidden={index !== 2}
            className="label text-ink-2 shrink-0 tracking-[0.18em]"
          >
            {MARQUESINA}
          </span>
        ))}
      </div>
    </section>
  );
}
