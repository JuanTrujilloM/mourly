'use client';

import { AuthGate } from '@/components/shared/AuthGate';
import { PreferencesForm } from '@/components/forms/PreferencesForm';

export default function EditInterestsPage() {
  return (
    <AuthGate>
      {(user) => (
        <>
          <div className="mb-6">
            <h1 className="heading text-ink text-[28px]">Editar intereses</h1>
            <p className="text-ink-2 mt-2 text-sm">
              Ajustá lo que buscás cuando quieras.
            </p>
          </div>

          <PreferencesForm user={user} edit />
        </>
      )}
    </AuthGate>
  );
}
