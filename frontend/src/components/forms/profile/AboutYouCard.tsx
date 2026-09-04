'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { ProfileValues } from '@/lib/validation/profile';
import { useCatalog } from '@/hooks/useCatalog';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Textarea';

export function AboutYouCard({ form }: { form: UseFormReturn<ProfileValues> }) {
  const { register, watch, formState } = form;
  const { errors } = formState;
  const {
    bounds: { maxBioLength },
  } = useCatalog();

  const bioLength = watch('biography')?.length ?? 0;

  return (
    <Card title="Sobre vos" description="Dejá que tu cita te conozca.">
      <Field label="Biografía" htmlFor="biography" error={errors.biography?.message}>
        <Textarea
          id="biography"
          rows={3}
          maxLength={maxBioLength}
          placeholder="Me gusta el café de especialidad y los planes al aire libre."
          hasError={!!errors.biography}
          {...register('biography')}
        />
        <p className="text-ink-3 text-right text-xs tabular-nums">
          {bioLength}/{maxBioLength}
        </p>
      </Field>
    </Card>
  );
}
