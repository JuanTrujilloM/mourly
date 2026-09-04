'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Logo } from '@/components/shared/Logo';
import { PhoneShell } from '@/components/shared/PhoneShell';
import { useMyProfile } from '@/hooks/useMyProfile';
import {
  AVAILABILITY_STATUS,
  type AvailabilityStatus,
} from '@/lib/constants/profile';
import type { AuthUser } from '@/types/auth';
import { DashboardPanel, InterestsPanel, ProfilePanel } from './panels';
import { StatusMenu } from './StatusMenu';
import { TABS, TabBar, tabIndexFor } from './TabBar';

const PANELS = [DashboardPanel, ProfilePanel, InterestsPanel];

// The three tabs stay mounted on a horizontal track that slides 320 ms with
// the brand curve. Tabs change the URL through the native history API, which
// Next.js syncs with usePathname, so deep links and back/forward keep working.
export function AppShell({
  user,
  children,
}: {
  user: AuthUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = tabIndexFor(pathname);
  const { data: profile, isLoading } = useMyProfile();

  const status =
    (profile?.status as AvailabilityStatus | undefined) ??
    AVAILABILITY_STATUS.SEARCHING;

  const goTo = (href: string) => {
    if (href !== pathname) window.history.pushState(null, '', href);
  };

  return (
    <PhoneShell variant="app">
      <header className="flex shrink-0 items-center justify-between px-5 pt-5 pb-3 sm:px-7">
        <Logo />
        <StatusMenu user={user} status={status} isLoading={isLoading} />
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div
          className="ease-brand flex h-full transition-transform duration-(--dur-slow) motion-reduce:transition-none"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {PANELS.map((Panel, index) => {
            const hidden = index !== active;
            // No bottom padding on the scroller: sticky bottom-0 pins to the
            // scroll container's content box, so padding here lifts the forms'
            // save bar off the tab bar. Each panel owns its own bottom air.
            return (
              <section
                key={TABS[index].href}
                aria-label={TABS[index].label}
                aria-hidden={hidden}
                inert={hidden}
                className="h-full w-full shrink-0 overflow-x-hidden overflow-y-auto px-5 pt-3 sm:px-7"
              >
                <Panel user={user} status={status} />
              </section>
            );
          })}
        </div>
      </div>

      <TabBar active={active} onSelect={goTo} />
      {children}
    </PhoneShell>
  );
}
