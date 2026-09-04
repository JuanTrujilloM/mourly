import type { ReactNode } from 'react';

export function Field({
  label,
  htmlFor,
  error,
  optional = false,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-ink-2 flex items-center gap-2 text-[12.5px] font-semibold"
      >
        {label}
        {optional && (
          <span className="text-ink-3 text-xs font-normal">(opcional)</span>
        )}
      </label>
      {children}
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );
}
