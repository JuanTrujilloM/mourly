import type { ReactNode } from 'react';
import { PhoneShell } from '@/components/shared/PhoneShell';

export default function EditProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PhoneShell backHref="/dashboard">{children}</PhoneShell>;
}
