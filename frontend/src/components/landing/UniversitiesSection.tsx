const UNIVERSITIES = [
  { name: 'EAFIT', color: 'text-u-eafit' },
  { name: 'UPB', color: 'text-u-upb' },
  { name: 'CES', color: 'text-u-ces' },
  { name: 'EIA', color: 'text-u-eia' },
];

// A printed strip, not a marquee: the brand allows no movement here. Siglas
// as typographic badges, never official logos: a logo reads as a partnership
// that does not exist and is a trademark we do not hold.
export function UniversitiesSection() {
  return (
    <section
      aria-label="Universidades de lanzamiento"
      className="border-line border-y px-4 py-8 sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-8">
        <p className="label text-ink-3">Estudiantes verificados de</p>
        <ul className="flex flex-wrap justify-center gap-3">
          {UNIVERSITIES.map((university) => (
            <li
              key={university.name}
              className={`display border-line rounded-full border px-5 py-1.5 text-[26px] tracking-[0.02em] ${university.color}`}
            >
              {university.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
