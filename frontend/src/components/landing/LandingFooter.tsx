import Image from 'next/image';
import Link from 'next/link';
import sello from '@/assets/brand/sello-verde.svg';

const LEGAL_LINKS = [
  { label: 'Sobre Mourly', href: '/about' },
  { label: 'Términos', href: '/terminos' },
  { label: 'Privacidad', href: '/privacidad' },
  { label: 'Habeas Data', href: '/habeas-data' },
];

// The wordmark lives in the navbar; a second dot on the same screen would be a feed.
export function LandingFooter() {
  return (
    <footer className="border-line border-t px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 sm:flex-row sm:items-end">
        <div className="flex items-center gap-4">
          <Image
            src={sello}
            alt="Sello: solo con carné, universidades privadas"
            width={64}
            height={64}
          />
          <div>
            <p className="text-ink text-sm font-semibold">mourly.com</p>
            <p className="text-ink-2 text-sm">
              Una cita real por semana. Solo con carné.
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-5 text-sm">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-ink-2 hover:text-ink transition"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-2 hover:text-ink transition"
          >
            Instagram
          </a>
        </nav>
      </div>

      <p className="text-ink-3 mx-auto mt-8 max-w-6xl text-center text-xs sm:text-left">
        © {new Date().getFullYear()} Mourly · Medellín
      </p>
    </footer>
  );
}
