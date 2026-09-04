import type { ReactNode } from 'react';

export function FlowState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="bg-surface border-line rounded-card border p-7 text-center">
      <h1 className="heading text-ink text-[28px]">{title}</h1>
      {description && <p className="text-ink-2 mt-3 text-sm">{description}</p>}
      {children}
    </div>
  );
}
