'use client';

import type { AuthUser } from '@/types/auth';
import { useProfileForm } from '@/hooks/useProfileForm';
import { Button } from '@/components/ui/Button';
import { PersonalInfoCard } from './profile/PersonalInfoCard';
import { PhotosCard } from './profile/PhotosCard';
import { AcademicInfoCard } from './profile/AcademicInfoCard';
import { AboutYouCard } from './profile/AboutYouCard';

export function ProfileForm({
  user,
  edit = false,
}: {
  user: AuthUser;
  edit?: boolean;
}) {
  const { form, university, onSubmit, isPending, isLoadingProfile } =
    useProfileForm(user, edit);
  const rootError = form.formState.errors.root?.message;

  if (edit && isLoadingProfile) {
    return <p className="text-ink-3 text-sm">Cargando tu perfil...</p>;
  }

  const label = edit ? 'Guardar cambios' : 'Continuar';

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <PersonalInfoCard form={form} />
      <PhotosCard form={form} />
      <AcademicInfoCard form={form} university={university} />
      <AboutYouCard form={form} />

      {rootError && <p className="text-error text-sm">{rootError}</p>}

      <div className="bg-page border-line sticky bottom-0 -mx-5 border-t px-5 py-4 sm:-mx-7 sm:px-7">
        <div className="flex justify-end">
          <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
            {isPending ? 'Guardando...' : label}
          </Button>
        </div>
      </div>
    </form>
  );
}
