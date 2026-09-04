import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps } from 'react';

type Variant = 'primary' | 'momento' | 'secondary' | 'ghost';
type Size = 'md' | 'sm';

// The brand lives in the moments, not in every button: primary is ink on
// paper. `momento` is mandarina and counts as the screen's single accent.
const variants: Record<Variant, string> = {
  primary: 'bg-btn-bg text-btn-fg hover:bg-btn-bg-hover',
  momento: 'bg-accent text-verde-900 hover:opacity-90',
  secondary: 'border-ink text-ink hover:bg-surface-2 border',
  ghost: 'text-ink-2 hover:text-ink hover:bg-surface-2',
};

const sizes: Record<Size, string> = {
  md: 'h-12 px-6 text-[15px]',
  sm: 'h-9 px-4 text-[13.5px]',
};

export function buttonClasses(
  variant: Variant = 'primary',
  size: Size = 'md',
  className = '',
): string {
  return `inline-flex items-center justify-center gap-2 rounded-full font-[650] tracking-[-0.005em] whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`;
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
