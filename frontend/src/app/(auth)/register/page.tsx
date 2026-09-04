import Link from 'next/link';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { GuestGate } from '@/components/shared/GuestGate';

export default function RegisterPage() {
  return (
    <GuestGate>
      <div className="space-y-2">
        <h1 className="heading text-ink text-[28px]">Creá tu cuenta</h1>
        <p className="text-ink-2 text-sm">
          Registrate con tu correo institucional para verificar que sos
          estudiante.
        </p>
      </div>

      <RegisterForm />

      <p className="text-ink-2 text-center text-xs">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="text-accent-text underline">
          Entrá
        </Link>
      </p>
    </GuestGate>
  );
}
