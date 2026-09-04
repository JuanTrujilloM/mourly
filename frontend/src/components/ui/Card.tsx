import type { ReactNode } from 'react';

export function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-surface border-line rounded-card border p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="subheading text-ink text-[22px]">{title}</h2>
        {description && <p className="text-ink-2 mt-1 text-sm">{description}</p>}
      </div>
      {children}
    </section>
  );
}
