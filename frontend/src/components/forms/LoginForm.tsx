'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginSchema, type LoginValues } from '@/lib/validation/auth';
import { useLogin } from '@/hooks/useLogin';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
  const router = useRouter();
  const { mutateAsync, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      await mutateAsync(values.email);
      router.push(`/verify?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) });
    }
  };

  return (
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
        {isPending ? 'Enviando...' : 'Enviar código de acceso'}
      </Button>
    </form>
  );
}
