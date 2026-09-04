import { forwardRef, type InputHTMLAttributes } from 'react';

// Focus is shown on the border (ink), not with the accent outline actions use.
const base =
  'bg-surface text-ink placeholder:text-gris-500 disabled:bg-surface-2 disabled:text-ink-2 h-12 w-full rounded-input border px-3.5 text-[15px] transition outline-none focus:border-ink focus:ring-1 focus:ring-ink';

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }
>(function Input({ className = '', hasError = false, ...props }, ref) {
  const borderColor = hasError ? 'border-error' : 'border-line';
  return (
    <input ref={ref} className={`${base} ${borderColor} ${className}`} {...props} />
  );
});
