import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'sunset' | 'cyan';

// Warm coral→flame gradient ("Atardecer") — the app-wide main CTA. Dark coral
// text for contrast on the bright fill.
const SUNSET =
  'bg-gradient-to-r from-coral to-flame text-[#4A1B0C] hover:brightness-105 shadow-[0_8px_30px_-8px_rgba(255,122,60,0.7)]';

const variants: Record<Variant, string> = {
  // Primary CTA is warm across the app; `sunset` kept as an explicit alias.
  primary: SUNSET,
  sunset: SUNSET,
  // Teal gradient for the identity-forward action (availability, confirmations).
  cyan: 'bg-gradient-to-r from-teal-soft to-teal text-navy-deep hover:brightness-105 shadow-[0_14px_30px_-10px_rgba(57,198,221,0.6),inset_0_1px_0_rgba(255,255,255,0.5)]',
  // Quiet glass pill for secondary actions (e.g. "Cerrar sesión").
  secondary:
    'border border-white/15 bg-white/[0.06] text-slate backdrop-blur-md hover:text-cream hover:border-white/25',
  // Transparent for low-emphasis actions.
  ghost: 'text-slate hover:text-cream',
};

// Brand button. Defaults to the cyan primary CTA; pass `variant` to switch.
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
