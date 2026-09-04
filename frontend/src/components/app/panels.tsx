'use client';

import { MatchSection } from '@/components/dashboard/MatchSection';
import { ProfileForm } from '@/components/forms/ProfileForm';
import { PreferencesForm } from '@/components/forms/PreferencesForm';
import type { AvailabilityStatus } from '@/lib/constants/profile';
import type { AuthUser } from '@/types/auth';

export interface PanelProps {
  user: AuthUser;
  status: AvailabilityStatus;
}

function PanelHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="heading text-ink text-[28px]">{title}</h1>
      <p className="text-ink-2 mt-2 text-sm">{subtitle}</p>
    </div>
  );
}

export function DashboardPanel({ status }: PanelProps) {
  // The shell's scroller has no bottom padding (see AppShell); the panel
  // adds its own air since nothing sticky closes it.
  return (
    <div className="pb-8">
      <MatchSection status={status} />
    </div>
  );
}

export function ProfilePanel({ user }: PanelProps) {
  return (
    <>
      <PanelHeading
        title="Perfil"
        subtitle="Actualizá tu información cuando quieras."
      />
      <ProfileForm user={user} edit />
    </>
  );
}

export function InterestsPanel({ user }: PanelProps) {
  return (
    <>
      <PanelHeading
        title="Intereses"
        subtitle="Ajustá lo que buscás cuando quieras."
      />
      <PreferencesForm user={user} edit />
    </>
  );
}
