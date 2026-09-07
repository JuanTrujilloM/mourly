import type { Company, Founder } from '@/lib/constants/company';
import type { LegalSection } from './types';

type ResponsibleCompany = Pick<
  Company,
  'name' | 'legalStatus' | 'city' | 'address' | 'contactEmail'
>;
type ResponsibleFounder = Pick<Founder, 'name' | 'role'>;

// Until the SAS is registered the data controllers are the founders as natural
// persons; the same block heads every legal page so it changes in one place.
export function responsibleSection(
  company: ResponsibleCompany,
  founders: readonly ResponsibleFounder[],
): LegalSection {
  const names = founders
    .map((founder) => `${founder.name} (${founder.role})`)
    .join(' y ');

  return {
    heading: 'Quién responde por Mourly y por sus datos',
    bullets: [
      `Responsable: ${names}, quienes operan la marca ${company.name}. ${company.legalStatus}; cuando la sociedad quede registrada asumirá esta posición y este documento se actualizará.`,
      `Domicilio: ${company.city}.`,
      ...(company.address ? [`Dirección: ${company.address}.`] : []),
      `Canal para consultas, reclamos y ejercicio de derechos: ${company.contactEmail}.`,
    ],
  };
}
