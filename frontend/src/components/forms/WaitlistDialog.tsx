'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { waitlistSchema, type WaitlistValues } from '@/lib/validation/auth';
import { useJoinWaitlist } from '@/hooks/useJoinWaitlist';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const TITLE = 'Todavía no llegamos a tu universidad';

export function WaitlistDialog({
  open,
  defaults,
  onClose,
}: {
  open: boolean;
  defaults: { email: string; cellphone: string };
  onClose: () => void;
}) {
  const { mutateAsync, isPending } = useJoinWaitlist();
  const [joined, setJoined] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<WaitlistValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { name: '', ...defaults },
  });

  const onSubmit = async (values: WaitlistValues) => {
    try {
      const { message } = await mutateAsync(values);
      setJoined(message);
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) });
    }
  };

  return (
    <Modal open={open} title={TITLE} onClose={onClose}>
      {joined ? (
        <div className="space-y-4">
          <p className="text-ink-2 text-sm">{joined}</p>
          <Button type="button" className="w-full" onClick={onClose}>
            Listo
          </Button>
        </div>
      ) : (
        <>
          <p className="text-ink-2 text-sm">
            Nos encantaría estar allá. Dejanos tus datos y te escribimos apenas
            abramos en tu universidad.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <Field
              label="Nombre"
              htmlFor="waitlist-name"
              error={errors.name?.message}
            >
              <Input
                id="waitlist-name"
                autoComplete="name"
                placeholder="Emmanuel Maya"
                hasError={!!errors.name}
                {...register('name')}
              />
            </Field>

            <Field
              label="Correo institucional"
              htmlFor="waitlist-email"
              error={errors.email?.message}
            >
              <Input
                id="waitlist-email"
                type="email"
                autoComplete="email"
                hasError={!!errors.email}
                {...register('email')}
              />
            </Field>

            <Field
              label="WhatsApp"
              htmlFor="waitlist-cellphone"
              error={errors.cellphone?.message}
            >
              <Input
                id="waitlist-cellphone"
                type="tel"
                autoComplete="tel"
                hasError={!!errors.cellphone}
                {...register('cellphone')}
              />
            </Field>

            {errors.root && (
              <p className="text-error text-sm">{errors.root.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Enviando...' : 'Avisame cuando abran'}
            </Button>
          </form>
        </>
      )}
    </Modal>
  );
}
