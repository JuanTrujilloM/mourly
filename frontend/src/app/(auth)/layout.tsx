import type { ReactNode } from 'react';
import { PhoneShell } from '@/components/shared/PhoneShell';
import { Logo } from '@/components/shared/Logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  // The column fills the shell so each page can pin its steps to the bottom
  // (mt-auto): on a phone the screen reads top to bottom instead of floating a
  // short form in the middle. The shell's scroller has no bottom padding (see
  // PhoneShell); the column carries it.
  return (
    <PhoneShell backHref="/" fill>
      <div className="flex flex-1 flex-col pb-8">
        <Logo className="self-start" />
        <div className="mt-10 flex w-full flex-1 flex-col gap-6">{children}</div>
      </div>
    </PhoneShell>
  );
}
