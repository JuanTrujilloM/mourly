'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AuthGate } from '@/components/shared/AuthGate';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>{(user) => <AppShell user={user}>{children}</AppShell>}</AuthGate>
  );
}
