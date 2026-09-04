import { forwardRef, type TextareaHTMLAttributes } from 'react';

const base =
  'bg-surface text-ink placeholder:text-gris-500 min-h-24 w-full resize-none rounded-input border px-3.5 py-3 text-[15px] transition outline-none focus:border-ink focus:ring-1 focus:ring-ink';

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
