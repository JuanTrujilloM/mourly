'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { emailEntrySchema, type EmailEntryValues } from '@/lib/validation/auth';
import { useRequestCode } from '@/hooks/useRequestCode';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { UNSUPPORTED_UNIVERSITY_MESSAGE } from '@/lib/constants/auth';
import { rememberResendCooldown } from '@/lib/utils/resend-cooldown';
import { WaitlistDialog } from './WaitlistDialog';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function EmailEntryForm() {
  const router = useRouter();
  const { mutateAsync, isPending } = useRequestCode();
  const [lead, setLead] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EmailEntryValues>({ resolver: zodResolver(emailEntrySchema) });

  const onSubmit = async ({ email }: EmailEntryValues) => {
    try {
      await mutateAsync(email);
      rememberResendCooldown(email);
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      const message = getApiErrorMessage(error);
      // An unreached university is an invitation, not a dead end.
      if (message === UNSUPPORTED_UNIVERSITY_MESSAGE) {
        setLead(email);
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

        {errors.root && (
          <p className="text-error text-sm">{errors.root.message}</p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Enviando...' : 'Enviar código'}
        </Button>

        <p className="text-ink-3 text-center text-xs">
          Al continuar aceptás los{' '}
          <Link href="/terminos" className="underline">
            Términos
          </Link>{' '}
          y la{' '}
          <Link href="/privacidad" className="underline">
            Política de privacidad
          </Link>
          .
        </p>
      </form>

      {lead && (
        <WaitlistDialog
          open
          defaults={{ email: lead, cellphone: '' }}
          onClose={() => setLead(null)}
        />
      )}
    </>
  );
}
