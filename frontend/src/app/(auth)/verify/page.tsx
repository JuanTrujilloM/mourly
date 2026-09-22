import { Suspense } from 'react';
import { EntrySteps } from '@/components/forms/EntrySteps';
import { VerificationForm } from '@/components/forms/VerificationForm';
import { Splash } from '@/components/shared/Splash';

export default function VerifyPage() {
  return (
    <>
      <div className="space-y-3">
        <p className="label text-accent-text">Entrada</p>
        <h1 className="heading text-ink text-[40px]">Verificá tu correo</h1>
      </div>

      <Suspense fallback={<Splash />}>
        <VerificationForm />
      </Suspense>

      <EntrySteps current={1} className="mt-auto" />
    </>
  );
}
