import Link from 'next/link';
import { LoginForm } from '@/components/forms/LoginForm';
import { GuestGate } from '@/components/shared/GuestGate';

export default function LoginPage() {
  return (
    <GuestGate>
      <div className="space-y-2">
        <h1 className="heading text-ink text-[28px]">Entrar</h1>
        <p className="text-ink-2 text-sm">
          Te enviamos un código de acceso a tu correo institucional.
        </p>
      </div>

      <LoginForm />

      <p className="text-ink-2 text-center text-xs">
        ¿No tenés cuenta?{' '}
        <Link href="/register" className="text-accent-text underline">
          Registrate
        </Link>
      </p>
    </GuestGate>
  );
}
