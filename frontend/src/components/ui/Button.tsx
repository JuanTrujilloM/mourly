import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'sunset' | 'cyan';

const SUNSET =
  'bg-gradient-to-r from-coral to-flame text-[#4A1B0C] hover:brightness-105 shadow-[0_8px_30px_-8px_rgba(255,122,60,0.7)]';

const variants: Record<Variant, string> = {
  primary: SUNSET,
  sunset: SUNSET,
  cyan: 'bg-cyan text-navy-deep hover:brightness-110 shadow-[0_8px_30px_-8px_rgba(0,229,255,0.6)]',
  secondary:
    'border border-blush/60 text-cream hover:bg-blush/10 hover:border-blush',
  ghost: 'text-slate hover:text-cream',
};

export function Button({
  className = '',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
