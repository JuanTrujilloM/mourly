import { EmailEntryForm } from '@/components/forms/EmailEntryForm';
import { GuestGate } from '@/components/shared/GuestGate';

export default function LoginPage() {
  return (
    <GuestGate>
      <div className="space-y-2">
        <h1 className="heading text-ink text-[28px]">Entrá con tu correo</h1>
        <p className="text-ink-2 text-sm">
          Te enviamos un código de 6 dígitos. Si es tu primera vez, con eso
          creamos tu cuenta.
        </p>
      </div>

      <EmailEntryForm />
    </GuestGate>
  );
}
