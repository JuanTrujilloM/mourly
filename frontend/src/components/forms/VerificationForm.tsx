'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  registerSchema,
  verifySchema,
  type VerifyValues,
} from '@/lib/validation/auth';
import { useVerifyCode } from '@/hooks/useVerifyCode';
import { useResendCode } from '@/hooks/useResendCode';
import {
  getApiErrorMessage,
  getApiErrorStatus,
  getApiRetryAfterSeconds,
} from '@/lib/utils/errors';
import { useResendCooldown } from './useResendCooldown';
import { ResendCodeButton } from './ResendCodeButton';
import { MissingEmailNotice } from './MissingEmailNotice';
import { VerificationCodeField } from './VerificationCodeField';
import { VerificationErrorNotice } from './VerificationErrorNotice';
import { ResendLimitDialog } from './ResendLimitDialog';
import { Button } from '@/components/ui/Button';

export function VerificationForm() {
  const router = useRouter();
  const rawEmail = useSearchParams().get('email') ?? '';
  const email = registerSchema.shape.email.safeParse(rawEmail).success
    ? rawEmail
    : '';

  const { mutateAsync: verify, isPending } = useVerifyCode();
  const { mutateAsync: resend, isPending: isResending } = useResendCode();

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
      router.push(user.onboardingCompleted ? '/dashboard' : '/onboarding/perfil');
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) });
    }
  };

  const onResend = async () => {
    setResendNotice(null);
    try {
      await resend(email);
      setResendNotice('Te enviamos un código nuevo.');
      startCooldown();
    } catch (error) {
      // 403 is the spent resend allowance; every other failure stays inline.
      if (getApiErrorStatus(error) === 403) {
        setResendLimitReached(true);
        return;
      }
      // Both the per-user cooldown and the route rate limit answer 429 with the
      // seconds left, so the counter can pick up where the server actually is.
      const retryAfter = getApiRetryAfterSeconds(error);
      if (retryAfter) startCooldown(retryAfter);
      setResendNotice(getApiErrorMessage(error));
    }
  };

  // The API answers login and register neutrally, so a code is only sent when
  // the email is eligible: this copy must not promise one outright.
  return (
    <div className="space-y-4">
      <p className="text-ink-2 text-sm">
        Si <span className="text-ink font-medium">{email}</span> es una cuenta
        válida, te enviamos un código de 6 dígitos. Ingresalo acá.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <VerificationCodeField
          registration={register('code')}
          error={errors.code}
        />

        {errors.root?.message && (
          <VerificationErrorNotice message={errors.root.message} />
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
