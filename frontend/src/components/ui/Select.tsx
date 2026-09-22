import { forwardRef, type SelectHTMLAttributes } from 'react';

const base =
  'bg-surface text-ink h-13 w-full rounded-input border px-3.5 text-[15px] transition outline-none focus:border-accent-text focus:ring-3 focus:ring-accent-tint';

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
