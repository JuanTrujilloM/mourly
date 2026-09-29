import { forwardRef, type InputHTMLAttributes } from 'react';
import { Input } from './Input';

export const PhoneInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }
>(function PhoneInput({ className = '', ...props }, ref) {
  return (
    <div className="relative">
      <span className="text-ink-2 pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[15px]">
        +57
      </span>
      {/* Important modifier: Input's base px-3.5 would otherwise win over pl-13. */}
      <Input
        ref={ref}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="300 123 4567"
        className={`pl-13! ${className}`}
        {...props}
      />
    </div>
  );
});
