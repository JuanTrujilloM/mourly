import Link from 'next/link';

// Any verify failure can also mean the email was never registered: the API
// keeps both cases indistinguishable, so the register link is always offered.
export function VerificationErrorNotice({ message }: { message: string }) {
  return (
    <div className="space-y-1">
      <p className="text-error text-sm">{message}</p>
      <p className="text-ink-2 text-xs">
        ¿No tenés cuenta?{' '}
        <Link href="/register" className="text-accent-text underline">
          Registrate
        </Link>
        .
      </p>
    </div>
  );
}
