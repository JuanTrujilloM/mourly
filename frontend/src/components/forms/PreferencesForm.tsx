'use client';

import type { AuthUser } from '@/types/auth';
import { usePreferencesForm } from '@/hooks/usePreferencesForm';
import { Button } from '@/components/ui/Button';
import { AgeRangeCard } from './preferences/AgeRangeCard';
import { HobbiesCard } from './preferences/HobbiesCard';
import { RelationshipCard } from './preferences/RelationshipCard';
import { LookingForCard } from './preferences/LookingForCard';
import { VibeCard } from './preferences/VibeCard';

export function PreferencesForm({
  user,
  edit = false,
}: {
  user: AuthUser;
  edit?: boolean;
}) {
  const { form, onSubmit, isPending, isLoadingPreferences, bounds } =
    usePreferencesForm(user, edit);
  const rootError = form.formState.errors.root?.message;

  if (edit && isLoadingPreferences) {
    return <p className="text-ink-3 text-sm">Cargando tus intereses...</p>;
  }

  const label = edit ? 'Guardar cambios' : 'Listo, quiero mi cita';

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <AgeRangeCard form={form} bounds={bounds} />
      <HobbiesCard form={form} />
      <RelationshipCard form={form} />
      <LookingForCard form={form} />
      <VibeCard form={form} />

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
