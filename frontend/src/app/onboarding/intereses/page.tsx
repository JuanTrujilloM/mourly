'use client';

import { AuthGate } from '@/components/shared/AuthGate';
import { OnboardingShell } from '@/components/shared/OnboardingShell';
import { PreferencesForm } from '@/components/forms/PreferencesForm';

export default function InterestsOnboardingPage() {
  return (
    <AuthGate>
      {(user) => (
        <OnboardingShell
          step={2}
          total={2}
          stepLabel="Intereses y preferencias"
          title="¿Qué buscás?"
          subtitle="Con esto elegimos a quién presentarte."
        >
          <PreferencesForm user={user} />
        </OnboardingShell>
      )}
    </AuthGate>
  );
}
