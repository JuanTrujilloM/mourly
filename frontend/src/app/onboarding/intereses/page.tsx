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
          title="¿Qué buscas?"
          subtitle="La IA usará esto para encontrar a tu match ideal."
        >
          <PreferencesForm user={user} />
        </OnboardingShell>
      )}
    </AuthGate>
  );
}
