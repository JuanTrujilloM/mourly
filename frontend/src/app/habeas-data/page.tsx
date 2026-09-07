import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { HABEAS_DATA } from '@/lib/legal/habeas-data';

export const metadata: Metadata = {
  title: 'Aviso de privacidad y habeas data — Mourly',
};

export default function Page() {
  return <LegalPage document={HABEAS_DATA} />;
}
