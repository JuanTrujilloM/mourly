import { forwardRef, type SelectHTMLAttributes } from 'react';

const base =
  'bg-surface text-ink h-12 w-full rounded-input border px-3.5 text-[15px] transition outline-none focus:border-ink focus:ring-1 focus:ring-ink';

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }
>(function Select({ className = '', hasError = false, children, ...props }, ref) {
  const borderColor = hasError ? 'border-error' : 'border-line';
  return (
    <select
      ref={ref}
      className={`${base} ${borderColor} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});
