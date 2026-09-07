import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Card } from '@/components/ui/Card';
import { COMPANY, FOUNDERS } from '@/lib/constants/company';

export const metadata: Metadata = {
  title: 'Sobre Mourly — Startup de tecnología en Medellín',
  description:
    'Mourly es una startup de tecnología de Medellín, fundada en 2026, que organiza una cita real por semana para estudiantes verificados de universidades privadas.',
};

const TODAY = [
  'Cuentas verificadas con correo institucional de EAFIT, UPB, CES y EIA.',
  'Un motor de matching semanal que cada jueves cruza intereses, preferencias, disponibilidad y el feedback de citas anteriores para proponer una sola persona.',
  'Coordinación de horario y lugar por WhatsApp, con reserva en un lugar aliado cerca del campus.',
  'Feedback después de cada cita: la confiabilidad de cada persona pesa en su siguiente match.',
];

const NEXT = [
  'Reservas automáticas con los lugares aliados.',
  'Un matching que aprende de cómo salió cada cita, no solo de si ocurrió.',
  'Más universidades, empezando por Bogotá.',
];

const LEGAL_LINKS = [
  { label: 'Términos', href: '/terminos' },
  { label: 'Privacidad', href: '/privacidad' },
  { label: 'Habeas Data', href: '/habeas-data' },
];

function SectionLabel({ children }: { children: string }) {
  return <p className="label text-ink-3 mt-16">{children}</p>;
}

export default function AboutPage() {
  return (
    <div className="bg-page flex flex-1 flex-col">
      <LandingNavbar />
      <main className="px-4 pt-28 pb-20 sm:px-6 sm:pt-36">
        <div className="mx-auto max-w-3xl">
          <p className="label text-ink-3">Sobre Mourly</p>
          <h1 className="heading text-ink mt-3 text-4xl sm:text-5xl">
            Una startup de Medellín para que la gente se conozca en persona.
          </h1>
          <p className="text-ink-2 mt-6 text-lg">
            Mourly is a Medellín-based technology startup building a new way
            for young adults to meet offline.
          </p>
          <p className="label text-ink-3 mt-8">
            {COMPANY.name} · {COMPANY.city} · Fundada en {COMPANY.foundedYear}{' '}
            · Sociedad en constitución
          </p>

          <SectionLabel>Misión</SectionLabel>
          <p className="text-ink mt-3 text-2xl leading-snug">
            Que los universitarios en Colombia conozcan gente real sin pasar
            semanas deslizando: una cita por semana, en un lugar público, con
            alguien verificado.
          </p>

          <SectionLabel>Fundadores</SectionLabel>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {FOUNDERS.map((founder) => (
              <Card
                key={founder.name}
                title={founder.name}
                description={founder.role}
              >
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`LinkedIn de ${founder.name}`}
                  className="text-ink hover:text-ink-2 text-sm font-medium underline underline-offset-4 transition"
                >
                  LinkedIn
                </a>
              </Card>
            ))}
          </div>
          <p className="text-ink-2 mt-4">
            Los dos construimos el producto y la tecnología.
          </p>

          <SectionLabel>Producto</SectionLabel>
          <h2 className="subheading text-ink mt-3 text-[22px]">Hoy</h2>
          <ul className="text-ink-2 mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            {TODAY.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h2 className="subheading text-ink mt-8 text-[22px]">Lo que sigue</h2>
          <ul className="text-ink-2 mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            {NEXT.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <SectionLabel>Contacto</SectionLabel>
          <p className="text-ink-2 mt-3">
            Escríbanos a{' '}
            <a
              href={`mailto:${COMPANY.contactEmail}`}
              className="text-ink underline underline-offset-4"
            >
              {COMPANY.contactEmail}
            </a>
            .
          </p>
          <nav className="mt-4 flex flex-wrap gap-5 text-sm">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ink-2 hover:text-ink transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
