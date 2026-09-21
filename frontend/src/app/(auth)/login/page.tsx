import { EmailEntryForm } from '@/components/forms/EmailEntryForm';
import { EntrySteps } from '@/components/forms/EntrySteps';
import { GuestGate } from '@/components/shared/GuestGate';

export default function LoginPage() {
  return (
    <GuestGate>
      <div className="space-y-3">
        <p className="label text-accent-text">Entrada</p>
        <h1 className="heading text-ink text-[40px]">Entrá con tu correo</h1>
        <p className="text-ink-2 text-[15px] leading-relaxed">
          Te enviamos un código de 6 dígitos. Si es tu primera vez, con eso
          creamos tu cuenta.
        </p>
      </div>

      <EmailEntryForm />

      <EntrySteps current={1} className="mt-auto" />
    </GuestGate>
  );
}
