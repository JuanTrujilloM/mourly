import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { TERMINOS } from '@/lib/legal/terminos';

export const metadata: Metadata = {
  title: 'Términos y condiciones — Mourly',
};

export default function Page() {
  return <LegalPage document={TERMINOS} />;
}
