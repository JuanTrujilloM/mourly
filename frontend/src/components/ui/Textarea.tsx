import { forwardRef, type TextareaHTMLAttributes } from 'react';

const base =
  'bg-surface text-ink placeholder:text-ink-3 min-h-24 w-full resize-none rounded-input border px-3.5 py-3 text-[15px] transition outline-none focus:border-accent-text focus:ring-3 focus:ring-accent-tint';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }
>(function Textarea({ className = '', hasError = false, ...props }, ref) {
  const borderColor = hasError ? 'border-error' : 'border-line';
  return (
    <textarea
      ref={ref}
      className={`${base} ${borderColor} ${className}`}
      {...props}
    />
  );
});
