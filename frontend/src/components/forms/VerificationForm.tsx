'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  emailEntrySchema,
  verifySchema,
  type VerifyValues,
} from '@/lib/validation/auth';
import { useVerifyCode } from '@/hooks/useVerifyCode';
import { useRequestCode } from '@/hooks/useRequestCode';
import { nextRouteFor } from '@/lib/auth/next-route';
import {
  getApiErrorMessage,
  getApiRetryAfterSeconds,
} from '@/lib/utils/errors';
import { hasSpentResends, recordResend } from '@/lib/utils/resend-allowance';
import { useResendCooldown } from './useResendCooldown';
import { ResendCodeButton } from './ResendCodeButton';
import { MissingEmailNotice } from './MissingEmailNotice';
import { VerificationCodeField } from './VerificationCodeField';
import { ResendLimitDialog } from './ResendLimitDialog';
import { Button } from '@/components/ui/Button';

export function VerificationForm() {
  const router = useRouter();
  const rawEmail = useSearchParams().get('email') ?? '';
  const email = emailEntrySchema.shape.email.safeParse(rawEmail).success
    ? rawEmail
    : '';

  const { mutateAsync: verify, isPending } = useVerifyCode();
  const { mutateAsync: resend, isPending: isResending } = useRequestCode();

  const { cooldown, startCooldown } = useResendCooldown(email);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [resendLimitReached, setResendLimitReached] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VerifyValues>({ resolver: zodResolver(verifySchema) });

  if (!email) {
    return <MissingEmailNotice />;
  }

  const onSubmit = async (values: VerifyValues) => {
    try {
      const user = await verify({ email, code: values.code });
      router.push(nextRouteFor(user));
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) });
    }
  };

  const onResend = async () => {
    setResendNotice(null);
    if (hasSpentResends(email)) {
      setResendLimitReached(true);
      return;
    }
    try {
      await resend(email);
      recordResend(email);
      setResendNotice('Te enviamos un código nuevo.');
      startCooldown();
    } catch (error) {
      // The route rate limit answers 429 with the seconds left, so the counter
      // can pick up where the server actually is.
      const retryAfter = getApiRetryAfterSeconds(error);
      if (retryAfter) startCooldown(retryAfter);
      setResendNotice(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-ink-2 text-sm">
        Te enviamos un código de 6 dígitos a{' '}
        <span className="text-ink font-medium">{email}</span>. Ingresalo acá.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <VerificationCodeField
          registration={register('code')}
          error={errors.code}
        />

        {errors.root?.message && (
          <p className="text-error text-sm">{errors.root.message}</p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Verificando...' : 'Verificar'}
        </Button>
      </form>

      <ResendCodeButton
        cooldown={cooldown}
        isResending={isResending}
        notice={resendNotice}
        onResend={onResend}
      />

      <ResendLimitDialog
        open={resendLimitReached}
        onClose={() => setResendLimitReached(false)}
      />
    </div>
  );
}
