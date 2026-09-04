import type { ReactNode } from 'react';
import { Logo } from '@/components/shared/Logo';
import { ProgressSteps } from '@/components/ui/ProgressSteps';

export function OnboardingShell({
  step,
  total,
  stepLabel,
  title,
  subtitle,
  children,
}: {
  step: number;
  total: number;
  stepLabel: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>

      <ProgressSteps current={step} total={total} label={stepLabel} />

      <div className="mt-6 mb-6 text-center">
        <h1 className="heading text-ink text-4xl">{title}</h1>
        <p className="text-ink-2 mt-2 text-sm">{subtitle}</p>
      </div>

      {children}
    </div>
  );
}
