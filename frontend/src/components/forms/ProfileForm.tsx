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
    return <p className="text-slate animate-pulse text-sm">Cargando tu perfil...</p>;
  }

  const label = edit ? 'Guardar cambios' : 'Continuar →';

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-28 sm:pb-6" noValidate>
      <PersonalInfoCard form={form} />
      <PhotosCard form={form} />
      <AcademicInfoCard form={form} university={university} />
      <AboutYouCard form={form} />

      {rootError && <p className="text-blush text-sm">{rootError}</p>}

      <div className="border-white/10 bg-navy-deep/90 fixed inset-x-0 bottom-0 border-t p-4 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-2xl justify-end sm:max-w-none">
          <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
            {isPending ? 'Guardando...' : label}
          </Button>
        </div>
      </div>
    </form>
  );
}
