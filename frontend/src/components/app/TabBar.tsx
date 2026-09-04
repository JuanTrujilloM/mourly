'use client';

import type { ReactNode } from 'react';

interface Tab {
  href: string;
  label: string;
  icon: ReactNode;
}

const iconProps = {
  viewBox: '0 0 24 24',
  className: 'h-6 w-6',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

// Monochrome line icons, stroke 1.75, as the brand guide asks. No dot here:
// the only dot on a screen is the wordmark's.
export const TABS: Tab[] = [
  {
    href: '/dashboard',
    label: 'Cita',
    icon: (
      <svg {...iconProps}>
        <rect x="3.5" y="5" width="17" height="15" rx="3" />
        <path d="M8 3v4M16 3v4M3.5 10h17" />
      </svg>
    ),
  },
  {
    href: '/perfil',
    label: 'Perfil',
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
      </svg>
    ),
  },
  {
    href: '/intereses',
    label: 'Intereses',
    icon: (
      <svg {...iconProps}>
        <path d="M4 7h9M17.5 7H20M4 12h2.5M11 12h9M4 17h11M19.5 17H20" />
        <circle cx="15.25" cy="7" r="1.75" />
        <circle cx="8.75" cy="12" r="1.75" />
        <circle cx="17.25" cy="17" r="1.75" />
      </svg>
    ),
  },
];

export function tabIndexFor(pathname: string): number {
  const index = TABS.findIndex(
    (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
  );
  return index === -1 ? 0 : index;
}

export function TabBar({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (href: string) => void;
}) {
  return (
    <nav
      aria-label="Secciones"
      className="border-line bg-surface shrink-0 border-t pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-3">
        {TABS.map((tab, index) => {
          const isActive = index === active;
          return (
            <li key={tab.href}>
              <a
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onSelect(tab.href);
                }}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition duration-(--dur-fast) ${
                  isActive ? 'text-ink' : 'text-ink-3 hover:text-ink-2'
                }`}
              >
                {tab.icon}
                {tab.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
