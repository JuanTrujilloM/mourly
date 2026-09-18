import { Suspense } from 'react';
import { VerificationForm } from '@/components/forms/VerificationForm';
import { Splash } from '@/components/shared/Splash';

export default function VerifyPage() {
  return (
    <>
      <h1 className="heading text-ink text-[28px]">Verificá tu correo</h1>

      <Suspense fallback={<Splash />}>
        <VerificationForm />
      </Suspense>
    </>
  );
}
