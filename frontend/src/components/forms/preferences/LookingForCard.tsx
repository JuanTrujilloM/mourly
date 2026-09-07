'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import type { PreferencesValues } from '@/lib/validation/preferences';
import { useCatalog } from '@/hooks/useCatalog';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { PillSelect } from '@/components/ui/PillSelect';
import { Chip } from '@/components/ui/Chip';
import { ChipGroup } from '@/components/ui/ChipGroup';

export function LookingForCard({
  form,
}: {
  form: UseFormReturn<PreferencesValues>;
}) {
  const { genderInterests, heightRanges } = useCatalog();
  const { errors } = form.formState;

  return (
    <Card title="Tu cita ideal" description="Contanos a quién buscás.">
      <div className="space-y-6">
        <Field
          label="¿Qué género te interesa? Elegí uno o varios."
          error={errors.genderInterests?.message}
        >
          <Controller
            control={form.control}
            name="genderInterests"
            render={({ field }) => (
              <ChipGroup
                options={genderInterests}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Field>

        <Field label="Preferencia de estatura" error={errors.heightRange?.message}>
          <Controller
            control={form.control}
            name="heightRange"
            render={({ field }) => (
              <PillSelect
                options={heightRanges}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Field>

        <Field
          label="¿De tu misma universidad?"
          error={errors.sameUniversity?.message}
        >
          <Controller
            control={form.control}
            name="sameUniversity"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                <Chip
                  label="Sí"
                  selected={field.value === true}
                  onToggle={() => field.onChange(true)}
                />
                <Chip
                  label="No importa"
                  selected={field.value === false}
                  onToggle={() => field.onChange(false)}
                />
              </div>
            )}
          />
        </Field>
      </div>
    </Card>
  );
}
