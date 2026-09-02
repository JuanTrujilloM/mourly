'use client';

import { AuthGate } from '@/components/shared/AuthGate';
import { OnboardingShell } from '@/components/shared/OnboardingShell';
import { ProfileForm } from '@/components/forms/ProfileForm';

export default function ProfileOnboardingPage() {
  return (
    <AuthGate>
      {(user) => (
        <OnboardingShell
          step={1}
          total={2}
          stepLabel="Perfil personal"
          title="Cuéntanos sobre ti"
          subtitle="Esto es lo que tu match verá primero."
        >
          <ProfileForm user={user} />
        </OnboardingShell>
      )}
    </AuthGate>
  );
}
