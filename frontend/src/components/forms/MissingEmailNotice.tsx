import Link from 'next/link';

export function MissingEmailNotice() {
  return (
    <p className="text-slate text-sm">
      No encontramos tu correo.{' '}
      <Link href="/register" className="text-cyan underline">
        Vuelve a registrarte
      </Link>
      .
    </p>
  );
}
