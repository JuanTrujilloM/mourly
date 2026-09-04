'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/Logo';
import { LogoutButton } from '@/components/shared/LogoutButton';
import type { AuthUser } from '@/types/auth';

interface NavItem {
  href: string;
  label: string;
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Resumen' },
  { href: '/admin/matches', label: 'Matches' },
  { href: '/admin/usuarios', label: 'Usuarios' },
  { href: '/admin/venues', label: 'Lugares' },
  { href: '/admin/feedback', label: 'Feedback' },
  { href: '/admin/reportes', label: 'Reportes' },
];

function isActive(pathname: string, href: string): boolean {
  return href === '/admin' ? pathname === href : pathname.startsWith(href);
}

// The admin panel is one of the three night surfaces of the brand.
export function AdminShell({
  user,
  children,
}: {
  user: AuthUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const current = NAV.find((item) => isActive(pathname, item.href));

  return (
    <div className="noche bg-page text-ink flex min-h-screen w-full">
      <aside className="border-line bg-surface sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r px-4 py-6">
        <div className="px-2">
          <Logo />
          <p className="label text-ink-3 mt-2">Panel de administración</p>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-input px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-surface-2 text-ink'
                    : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/dashboard"
          className="text-ink-2 hover:text-ink mt-2 px-3 py-2 text-xs transition"
        >
          Volver a la app
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-line bg-page sticky top-0 z-10 flex items-center justify-between gap-4 border-b px-8 py-4">
          <h2 className="subheading text-ink text-[22px]">
            {current?.label ?? 'Panel'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-ink-2 hidden text-sm sm:inline">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
