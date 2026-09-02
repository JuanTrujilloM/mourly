'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Floating pill nav for the dashboard. Sticky (not fixed) so it floats inside
// the PhoneShell scroll column instead of escaping the phone frame on desktop.
// The active item expands into a white pill with its label, mockup-style.

type NavItem = { href: string; label: string; icon: React.ReactNode };

const ICON_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const HeartIcon = (
  <svg {...ICON_PROPS} className="h-[19px] w-[19px]">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const SparklesIcon = (
  <svg {...ICON_PROPS} className="h-[19px] w-[19px]">
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    <path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z" />
  </svg>
);

const PersonIcon = (
  <svg {...ICON_PROPS} className="h-[19px] w-[19px]">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PinIcon = (
  <svg {...ICON_PROPS} className="h-[19px] w-[19px]">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export function DashboardBottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: '/dashboard', label: 'Inicio', icon: HeartIcon },
    { href: '/intereses', label: 'Intereses', icon: SparklesIcon },
    { href: '/perfil', label: 'Perfil', icon: PersonIcon },
    ...(isAdmin
      ? [{ href: '/admin/venues', label: 'Lugares', icon: PinIcon }]
      : []),
  ];

  return (
    // Mobile (<sm): the phone frame grows with content and the document itself
    // scrolls, so sticky never engages — pin to the viewport with fixed. From sm
    // up the frame's inner column scrolls: mt-auto reaches the frame bottom on
    // short pages, sticky keeps the pill visible while long pages scroll.
    <div className="fixed inset-x-0 bottom-4 z-20 sm:sticky sm:inset-x-auto sm:bottom-0 sm:mt-auto sm:pt-8">
      <nav className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-navy/80 p-1.5 shadow-[0_20px_44px_-18px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'text-navy-deep bg-gradient-to-r from-white to-[#e9f3fb] shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5)]'
                  : 'text-slate hover:text-cream'
              }`}
            >
              {item.icon}
              {active && item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
