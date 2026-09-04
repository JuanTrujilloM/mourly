'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function ShellBackButton({ href }: { href?: string }) {
  const router = useRouter();

  const className =
    'text-ink-2 hover:text-ink border-line bg-surface inline-flex h-9 w-9 items-center justify-center rounded-full border transition';

  const chevron = (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Volver" className={className}>
        {chevron}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Volver"
      className={className}
    >
      {chevron}
    </button>
  );
}
