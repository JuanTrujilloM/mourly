'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/shared/Logo';
import { ButtonLink } from '@/components/ui/Button';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition ${
        scrolled ? 'bg-page border-line' : 'border-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="text-ink-2 hover:text-ink px-2 text-sm font-medium transition"
          >
            Entrar
          </Link>
          <ButtonLink href="/register" size="sm">
            Quiero mi cita
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
}
