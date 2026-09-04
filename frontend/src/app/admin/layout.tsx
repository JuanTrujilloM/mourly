'use client';

import type { ReactNode } from 'react';
import { AdminGate } from '@/components/admin/AdminGate';
import { AdminShell } from '@/components/admin/AdminShell';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGate>
      {(user) => <AdminShell user={user}>{children}</AdminShell>}
    </AdminGate>
  );
}
