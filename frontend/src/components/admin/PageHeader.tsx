import type { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="heading text-ink text-[28px]">{title}</h1>
        {description && <p className="text-ink-2 mt-1.5 text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
