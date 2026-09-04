import Link from 'next/link';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 text-lg font-bold tracking-tight ${className}`}
    >
      <span
        className="from-coral to-flame bg-gradient-to-r bg-clip-text text-transparent"
        aria-hidden
      >
        ♥
      </span>
      <span className="text-cream">Mourly</span>
    </Link>
  );
}
