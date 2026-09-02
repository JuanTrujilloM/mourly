import { forwardRef, type InputHTMLAttributes } from 'react';

const base =
  'w-full rounded-xl border bg-navy-soft px-4 py-2.5 text-sm text-cream placeholder:text-slate outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/30';

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }
>(function Input({ className = '', hasError = false, ...props }, ref) {
  const borderColor = hasError ? 'border-blush' : 'border-white/10';
  return (
    <input ref={ref} className={`${base} ${borderColor} ${className}`} {...props} />
  );
});
