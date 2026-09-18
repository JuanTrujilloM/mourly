'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { verifySchema, type VerifyValues } from '@/lib/validation/auth';
import { useSendPhoneCode } from '@/hooks/useSendPhoneCode';
import { useVerifyPhoneCode } from '@/hooks/useVerifyPhoneCode';
import { nextRouteFor } from '@/lib/auth/next-route';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { remainingResendCooldown } from '@/lib/utils/resend-cooldown';
import { hasSpentResends, recordResend } from '@/lib/utils/resend-allowance';
import { useResendCooldown } from './useResendCooldown';
import { ResendCodeButton } from './ResendCodeButton';
import { ResendLimitDialog } from './ResendLimitDialog';
import { VerificationCodeField } from './VerificationCodeField';
import { Button } from '@/components/ui/Button';

const SMS_LIMIT_HINT =
  'Ya te mandamos varios códigos por SMS. El último sigue sirviendo.';

export function PhoneCodeStep({
  cellphone,
  onChangeNumber,
}: {
  cellphone: string;
  onChangeNumber: () => void;
}) {
  const router = useRouter();
  const { mutateAsync: verify, isPending } = useVerifyPhoneCode();
  const { mutateAsync: sendCode, isPending: isResending } = useSendPhoneCode();
  const { cooldown, startCooldown } = useResendCooldown(cellphone);
  const [notice, setNotice] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const autoSent = useRef(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VerifyValues>({ resolver: zodResolver(verifySchema) });

  // A code goes out on arrival unless one was just sent (cooldown still running).
  useEffect(() => {
    if (autoSent.current || remainingResendCooldown(cellphone) > 0) return;
    autoSent.current = true;
    sendCode()
      .then(() => startCooldown())
      .catch((error: unknown) => setNotice(getApiErrorMessage(error)));
  }, [cellphone, sendCode, startCooldown]);

  const onSubmit = async (values: VerifyValues) => {
    try {
      const user = await verify(values.code);
      router.push(nextRouteFor(user));
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) });
    }
  };

  const onResend = async () => {
    setNotice(null);
    if (hasSpentResends(cellphone)) {
      setLimitReached(true);
      return;
    }
    try {
      await sendCode();
      recordResend(cellphone);
      setNotice('Te enviamos un código nuevo.');
      startCooldown();
    } catch (error) {
      setNotice(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-ink-2 text-sm">
        Te enviamos un código de 6 dígitos por SMS al{' '}
        <span className="text-ink font-medium">{cellphone}</span>.{' '}
        <button
          type="button"
          onClick={onChangeNumber}
          className="text-accent-text underline"
        >
          Cambiar número
        </button>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <VerificationCodeField registration={register('code')} error={errors.code} />
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
        notice={notice}
        onResend={onResend}
      />

      <ResendLimitDialog
        open={limitReached}
        onClose={() => setLimitReached(false)}
        hint={SMS_LIMIT_HINT}
        footer={
          <button type="button" onClick={onChangeNumber} className="text-accent-text underline">
            Cambiar número
          </button>
        }
      />
    </div>
  );
}
