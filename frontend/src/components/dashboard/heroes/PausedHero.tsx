// Informational hero for the PAUSED state. Reactivation is handled by the
// AvailabilityToggle rendered right below it, so this carries no action of its own.
export function PausedHero() {
  return (
    <section className="glass-card p-6">
      <span className="border-white/15 text-slate inline-flex items-center gap-1.5 rounded-full border bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold">
        ⏸ Búsqueda en pausa
      </span>
      <h1 className="font-serif text-cream mt-4 text-2xl leading-tight font-semibold">
        No entrarás al match de esta semana
      </h1>
      <p className="text-slate mt-2 text-sm leading-relaxed">
        Reactiva cuando quieras volver a la lista del jueves.
      </p>
    </section>
  );
}
