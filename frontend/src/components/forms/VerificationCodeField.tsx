'use client';

import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

export function VerificationCodeField({
  registration,
  error,
}: {
  registration: UseFormRegisterReturn;
  error?: FieldError;
}) {
  return (
    <div className="space-y-1">
      <Input
        id="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="••••••"
        className="text-center text-lg tracking-[0.4em]"
        {...registration}
      />
      {error && <p className="text-blush text-xs">{error.message}</p>}
    </div>
  );
}
