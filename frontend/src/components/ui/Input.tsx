import { forwardRef, type InputHTMLAttributes } from 'react';

// Focus is shown on the border plus a soft magenta ring, not with the outline
// actions use.
const base =
  'bg-surface text-ink placeholder:text-ink-3 disabled:bg-surface-2 disabled:text-ink-2 h-13 w-full rounded-input border px-3.5 text-[15px] transition outline-none focus:border-accent-text focus:ring-3 focus:ring-accent-tint';

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }
>(function Input({ className = '', hasError = false, ...props }, ref) {
  const borderColor = hasError ? 'border-error' : 'border-line';
  return (
    <input ref={ref} className={`${base} ${borderColor} ${className}`} {...props} />
  );
});
