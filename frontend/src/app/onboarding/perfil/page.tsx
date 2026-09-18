'use client';

import { AuthGate } from '@/components/shared/AuthGate';
import { OnboardingShell } from '@/components/shared/OnboardingShell';
import { ProfileForm } from '@/components/forms/ProfileForm';

export default function ProfileOnboardingPage() {
  return (
    <AuthGate>
      {(user) => (
        <OnboardingShell
          step={2}
          total={3}
          stepLabel="Perfil"
          title="Contanos de vos"
          subtitle="Esto es lo primero que va a ver tu cita."
        >
          <ProfileForm user={user} />
        </OnboardingShell>
      )}
    </AuthGate>
  );
}
