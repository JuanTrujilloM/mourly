import { Suspense } from 'react';
import { VerificationForm } from '@/components/forms/VerificationForm';

export default function VerifyPage() {
  return (
    <>
      <h1 className="heading text-ink text-[28px]">Verificá tu correo</h1>

      <Suspense fallback={<p className="text-ink-3 text-sm">Cargando...</p>}>
        <VerificationForm />
      </Suspense>
    </>
  );
}
