import Link from 'next/link';

// Brand wordmark. Glowing coral heart, "The" in cream and "Connection" in the
// teal identity gradient.
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 text-lg font-bold tracking-tight ${className}`}
    >
      <span
        className="text-coral text-[1.45em] leading-none [filter:drop-shadow(0_0_6px_rgba(255,122,89,0.9))_drop-shadow(0_0_14px_rgba(255,122,89,0.5))]"
        aria-hidden
      >
        ♥
      </span>
      <span>
        <span className="text-cream">The</span>
        <span className="from-teal to-teal-soft bg-gradient-to-r bg-clip-text text-transparent">
          Connection
        </span>
      </span>
    </Link>
  );
}
