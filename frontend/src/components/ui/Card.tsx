import type { ReactNode } from 'react';

// Card shell for one logical section of the onboarding forms.
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
    <section className="glass-card p-6 sm:p-7">
      <div className="mb-5">
        <h2 className="font-serif text-cream text-xl font-semibold">{title}</h2>
        {description && <p className="text-slate mt-1 text-sm">{description}</p>}
      </div>
      {children}
    </section>
  );
}
