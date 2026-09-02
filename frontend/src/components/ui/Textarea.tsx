import { forwardRef, type TextareaHTMLAttributes } from 'react';

const base =
  'w-full rounded-xl border bg-navy-soft px-4 py-2.5 text-sm text-cream placeholder:text-slate outline-none transition resize-none focus:border-cyan focus:ring-2 focus:ring-cyan/30';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }
>(function Textarea({ className = '', hasError = false, ...props }, ref) {
  const borderColor = hasError ? 'border-blush' : 'border-white/10';
  return (
    <textarea
      ref={ref}
      className={`${base} ${borderColor} ${className}`}
      {...props}
    />
  );
});
