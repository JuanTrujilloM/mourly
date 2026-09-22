import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps } from 'react';

type Variant = 'primary' | 'momento' | 'secondary' | 'ghost';
type Size = 'md' | 'sm';

// Primary is the magenta fill. `momento` is the same fill with the glow, kept
// for the one action a screen is about (the reveal, confirming a date).
const variants: Record<Variant, string> = {
  primary: 'bg-btn-bg text-btn-fg hover:bg-btn-bg-hover inset-shadow-glass',
  momento: 'bg-btn-bg text-btn-fg hover:bg-btn-bg-hover shadow-glow',
  secondary: 'border-line bg-surface text-ink hover:bg-surface-2 inset-shadow-glass border',
  ghost: 'text-ink-2 hover:text-ink hover:bg-surface-2',
};

const sizes: Record<Size, string> = {
  md: 'h-13 rounded-[18px] px-6 text-[15px]',
  sm: 'h-9 rounded-[13px] px-4 text-[13.5px]',
};

export function buttonClasses(
  variant: Variant = 'primary',
  size: Size = 'md',
  className = '',
): string {
  return `inline-flex items-center justify-center gap-2 font-[650] tracking-[-0.005em] whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`;
}

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

// A link that looks like a button, so buttons never nest inside anchors.
export function ButtonLink({
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
