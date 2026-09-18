'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cellphoneSchema, type CellphoneValues } from '@/lib/validation/auth';
import { useUpdateCellphone } from '@/hooks/useUpdateCellphone';
import { useSendPhoneCode } from '@/hooks/useSendPhoneCode';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { rememberResendCooldown } from '@/lib/utils/resend-cooldown';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function CellphoneStep({
  current,
  onSaved,
}: {
  current: string | null;
  onSaved: () => void;
}) {
  const update = useUpdateCellphone();
  const send = useSendPhoneCode();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CellphoneValues>({
    resolver: zodResolver(cellphoneSchema),
    defaultValues: { cellphone: current ?? '' },
  });

  const onSubmit = async ({ cellphone }: CellphoneValues) => {
    try {
      const saved = await update.mutateAsync(cellphone);
      // Verified on save while SMS verification is off; the page gate routes onward.
      if (saved.cellphoneVerified) return;
      await send.mutateAsync();
      rememberResendCooldown(saved.cellphone);
      onSaved();
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) });
    }
  };

  const busy = update.isPending || send.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <p className="text-ink-2 text-sm">
        Por SMS te avisamos de tu match y de tu cita. Solo números colombianos.
      </p>

      <Field label="Celular" htmlFor="cellphone" error={errors.cellphone?.message}>
        <Input
          id="cellphone"
          type="tel"
          autoComplete="tel"
          placeholder="300 123 4567"
          hasError={!!errors.cellphone}
          {...register('cellphone')}
        />
      </Field>

      {errors.root && <p className="text-error text-sm">{errors.root.message}</p>}

      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? 'Guardando...' : 'Continuar'}
      </Button>
    </form>
  );
}
