'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import type { PreferencesValues } from '@/lib/validation/preferences';
import { HOBBY_SUGGESTIONS } from '@/lib/constants/preferences';
import { useCatalog } from '@/hooks/useCatalog';
import { Card } from '@/components/ui/Card';
import { TagInput } from '@/components/ui/TagInput';

export function HobbiesCard({
  form,
}: {
  form: UseFormReturn<PreferencesValues>;
}) {
  const {
    bounds: { minHobbies },
  } = useCatalog();
  const error = form.formState.errors.hobbies?.message;

  return (
    <Card
      title="Hobbies"
      description={`Agrega al menos ${minHobbies}. Escribe los tuyos o elige de la lista.`}
    >
      <Controller
        control={form.control}
        name="hobbies"
        render={({ field }) => (
          <TagInput
            value={field.value}
            onChange={field.onChange}
            suggestions={HOBBY_SUGGESTIONS}
            hasError={!!error}
          />
        )}
      />
      {error && <p className="text-blush mt-2 text-xs">{error}</p>}
    </Card>
  );
}
