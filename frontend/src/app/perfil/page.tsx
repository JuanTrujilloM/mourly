'use client';

import { AuthGate } from '@/components/shared/AuthGate';
import { ProfileForm } from '@/components/forms/ProfileForm';

export default function EditProfilePage() {
  return (
    <AuthGate>
      {(user) => (
        <>
          <div className="mb-6">
            <h1 className="text-cream text-2xl font-bold">Editar perfil</h1>
            <p className="text-slate mt-1 text-sm">
              Actualiza tu información cuando quieras.
            </p>
          </div>

          <ProfileForm user={user} edit />
        </>
      )}
    </AuthGate>
  );
}
