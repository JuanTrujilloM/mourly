'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { ProfileValues } from '@/lib/validation/profile';
import { useCatalog } from '@/hooks/useCatalog';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export function AcademicInfoCard({
  form,
  university,
}: {
  form: UseFormReturn<ProfileValues>;
  university: string;
}) {
  const { semesters } = useCatalog();
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <Card title="Información académica" description="Tu vida en la universidad.">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Universidad">
          <Input value={university} readOnly disabled />
        </Field>

        <Field label="Carrera" htmlFor="major" error={errors.major?.message}>
          <Input
            id="major"
            placeholder="Administración de empresas"
            hasError={!!errors.major}
            {...register('major')}
          />
        </Field>

        <Field
          label="Semestre"
          htmlFor="semester"
          error={errors.semester?.message}
        >
          <Select
            id="semester"
            defaultValue=""
            hasError={!!errors.semester}
            {...register('semester')}
          >
            <option value="" disabled>
              Elegí...
            </option>
            {semesters.map((option) => (
              <option key={option} value={option}>
                {/^\d+$/.test(option) ? `Semestre ${option}` : option}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </Card>
  );
}
