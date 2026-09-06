'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registerSchema, type RegisterValues } from '@/lib/validation/auth';
import { useRegister } from '@/hooks/useRegister';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { UNSUPPORTED_UNIVERSITY_MESSAGE } from '@/lib/constants/auth';
import { rememberResendCooldown } from '@/lib/utils/resend-cooldown';
import { WaitlistDialog } from './WaitlistDialog';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function RegisterForm() {
  const router = useRouter();
  const { mutateAsync, isPending } = useRegister();
  const [lead, setLead] = useState<RegisterValues | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterValues) => {
    try {
      await mutateAsync(values);
      rememberResendCooldown(values.email);
      router.push(`/verify?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      const message = getApiErrorMessage(error);
      // An unreached university is an invitation, not a dead end.
      if (message === UNSUPPORTED_UNIVERSITY_MESSAGE) {
        setLead(values);
        return;
      }
      setError('root', { message });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field
          label="Correo institucional"
          htmlFor="email"
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nombre@eafit.edu.co"
            hasError={!!errors.email}
            {...register('email')}
          />
        </Field>

        <Field
          label="Celular"
          htmlFor="cellphone"
          error={errors.cellphone?.message}
        >
          <Input
            id="cellphone"
            type="tel"
            autoComplete="tel"
            placeholder="+57 300 123 4567"
            hasError={!!errors.cellphone}
            {...register('cellphone')}
          />
        </Field>

        {errors.root && (
          <p className="text-error text-sm">{errors.root.message}</p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Enviando...' : 'Continuar'}
        </Button>
      </form>

      {lead && (
        <WaitlistDialog open defaults={lead} onClose={() => setLead(null)} />
      )}
    </>
  );
}
