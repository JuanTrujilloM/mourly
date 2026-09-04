'use client';

import { AuthGate } from '@/components/shared/AuthGate';
import { ProfileForm } from '@/components/forms/ProfileForm';

export default function EditProfilePage() {
  return (
    <AuthGate>
      {(user) => (
        <>
          <div className="mb-6">
            <h1 className="heading text-ink text-[28px]">Editar perfil</h1>
            <p className="text-ink-2 mt-2 text-sm">
              Actualizá tu información cuando quieras.
            </p>
          </div>

          <ProfileForm user={user} edit />
        </>
      )}
    </AuthGate>
  );
}
