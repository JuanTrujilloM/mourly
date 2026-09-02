import type { ReactNode } from 'react';
import { PhoneShell } from '@/components/shared/PhoneShell';

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PhoneShell back>{children}</PhoneShell>;
}
