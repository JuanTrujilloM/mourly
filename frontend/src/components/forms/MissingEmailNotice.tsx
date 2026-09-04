import Link from 'next/link';

export function MissingEmailNotice() {
  return (
    <p className="text-ink-2 text-sm">
      No encontramos tu correo.{' '}
      <Link href="/register" className="text-accent-text underline">
        Volvé a registrarte
      </Link>
      .
    </p>
  );
}
