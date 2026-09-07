import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { PRIVACIDAD } from '@/lib/legal/privacidad';

export const metadata: Metadata = {
  title: 'Política de tratamiento de datos — Mourly',
};

export default function Page() {
  return <LegalPage document={PRIVACIDAD} />;
}
