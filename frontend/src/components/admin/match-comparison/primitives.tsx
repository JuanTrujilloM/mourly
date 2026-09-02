import type { ReactNode } from 'react';

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-white/10 bg-navy-card/40 rounded-2xl border p-5">
      <h2 className="text-cream mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-slate text-xs">{label}</dt>
      <dd className="text-cream">{value ?? '—'}</dd>
    </div>
  );
}

export function Signal({
  ok,
  neutral,
  children,
}: {
  ok: boolean;
  neutral?: boolean;
  children: ReactNode;
}) {
  const tone = neutral
    ? 'bg-white/5 text-slate'
    : ok
      ? 'bg-emerald-400/15 text-emerald-300'
      : 'bg-white/5 text-slate line-through';
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${tone}`}>
      {ok && !neutral ? '✓ ' : ''}
      {children}
    </span>
  );
}

export function SelectPill({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
        on ? 'bg-cyan text-navy-deep' : 'bg-white/5 text-slate'
      }`}
      title={on ? 'Seleccionado' : 'No seleccionado'}
    >
      {label}
    </span>
  );
}
