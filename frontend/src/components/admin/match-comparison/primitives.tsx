import type { ReactNode } from 'react';

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-line bg-surface rounded-card border p-5">
      <h2 className="text-ink mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-ink-3 text-xs">{label}</dt>
      <dd className="text-ink">{value ?? '—'}</dd>
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
    ? 'bg-surface-2 text-ink-2'
    : ok
      ? 'bg-surface-2 text-live'
      : 'bg-surface-2 text-ink-3 line-through';
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${tone}`}>
      {children}
    </span>
  );
}

export function SelectPill({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
        on ? 'bg-ink text-page' : 'bg-surface-2 text-ink-3'
      }`}
      title={on ? 'Seleccionado' : 'No seleccionado'}
    >
      {label}
    </span>
  );
}

// Rating stars: filled in ink, empty in the line color. Never gold.
export function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-ink" aria-label={`${rating} de 5`}>
      {'★'.repeat(rating)}
      <span className="text-line">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

// Errors in night sit on the error fill: error red as text fails on verde-950.
export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p className="bg-error text-hueso rounded-input inline-block px-3 py-2 text-sm">
      {children}
    </p>
  );
}
