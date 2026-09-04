// Temporary: static pricing shown while applying for cloud credits.
// To remove it, delete this file and its import in app/page.tsx.
const INCLUDED = [
  'Una cita real por semana',
  'Lugar aliado y reserva hecha por nosotros',
  'Cancelás cuando quieras',
];

export function PricingSection() {
  return (
    <section id="precio" className="border-line border-t px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="label text-ink-3">Cuánto cuesta</p>
          <h2 className="heading text-ink mt-3 text-4xl sm:text-5xl">
            Gratis hasta tu primera cita.
          </h2>
          <p className="text-ink-2 mt-4 max-w-md text-lg">
            Probás Mourly sin pagar. Después de tu primera cita, seguís con una
            suscripción mensual.
          </p>
        </div>

        <div className="bg-surface border-line rounded-card w-full border p-6 sm:p-7 lg:max-w-sm lg:justify-self-end">
          <p className="label text-ink-3">Suscripción</p>
          <p className="display text-ink mt-3 text-[56px] tabular-nums">$15.000</p>
          <p className="text-ink-2 mt-1 text-sm">
            COP al mes, a partir de tu primera cita.
          </p>
          <ul className="divide-line text-ink-2 mt-5 divide-y text-sm">
            {INCLUDED.map((item) => (
              <li key={item} className="py-2.5">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
