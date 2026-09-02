import type { ReactNode } from 'react';
import { PhoneShell } from '@/components/shared/PhoneShell';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <PhoneShell>{children}</PhoneShell>;
}
