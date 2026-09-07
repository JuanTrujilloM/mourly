'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import type { PreferencesValues } from '@/lib/validation/preferences';
import { useCatalog } from '@/hooks/useCatalog';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { PillSelect } from '@/components/ui/PillSelect';

export function RelationshipCard({
  form,
}: {
  form: UseFormReturn<PreferencesValues>;
}) {
  const { errors } = form.formState;
  const { relationshipTypes } = useCatalog();

  return (
    <Card title="Qué buscás" description="Definí el tipo de relación que querés.">
      <div className="space-y-6">
        <Field
          label="Tipo de relación"
          error={errors.relationshipType?.message}
        >
          <Controller
            control={form.control}
            name="relationshipType"
            render={({ field }) => (
              <PillSelect
                options={relationshipTypes}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Field>
      </div>
    </Card>
  );
}
