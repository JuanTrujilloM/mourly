'use client';

import { AuthGate } from '@/components/shared/AuthGate';
import { OnboardingShell } from '@/components/shared/OnboardingShell';
import { PhoneVerificationForm } from '@/components/forms/PhoneVerificationForm';

export default function CellphoneOnboardingPage() {
  return (
    <AuthGate>
      {(user) => (
        <OnboardingShell
          step={1}
          total={3}
          stepLabel="Celular"
          title="Verificá tu celular"
          subtitle="Por acá te avisamos de tu match y de tu cita."
        >
          <PhoneVerificationForm user={user} />
        </OnboardingShell>
      )}
    </AuthGate>
  );
}
