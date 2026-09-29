'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { ProfileValues } from '@/lib/validation/profile';
import { useCatalog } from '@/hooks/useCatalog';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export function PersonalInfoCard({
  form,
  birthDateLocked = false,
}: {
  form: UseFormReturn<ProfileValues>;
  birthDateLocked?: boolean;
}) {
  const { genders } = useCatalog();
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <Card title="Información personal" description="Lo básico sobre vos.">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            placeholder="Juan"
            hasError={!!errors.name}
            {...register('name')}
          />
        </Field>

        <Field
          label="Fecha de nacimiento"
          htmlFor="dateOfBirth"
          error={errors.dateOfBirth?.message}
        >
          {/* readOnly, not disabled: react-hook-form drops disabled values on submit. */}
          <Input
            id="dateOfBirth"
            type="date"
            readOnly={birthDateLocked}
            aria-describedby={birthDateLocked ? 'dateOfBirth-locked' : undefined}
            className="read-only:bg-surface-2 read-only:text-ink-2 read-only:cursor-not-allowed"
            hasError={!!errors.dateOfBirth}
            {...register('dateOfBirth')}
          />
          {birthDateLocked && (
            <p id="dateOfBirth-locked" className="text-ink-3 text-xs">
              No se puede cambiar después del registro.
            </p>
          )}
        </Field>

        <Field label="Género" htmlFor="gender" error={errors.gender?.message}>
          <Select
            id="gender"
            defaultValue=""
            hasError={!!errors.gender}
            {...register('gender')}
          >
            <option value="" disabled>
              Elegí...
            </option>
            {genders.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Estatura (cm)"
          htmlFor="height"
          error={errors.height?.message}
        >
          <Input
            id="height"
            type="number"
            inputMode="numeric"
            placeholder="175"
            hasError={!!errors.height}
            {...register('height', { valueAsNumber: true })}
          />
        </Field>
      </div>
    </Card>
  );
}
