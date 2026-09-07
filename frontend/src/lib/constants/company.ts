// Single source for who is behind Mourly. Feeds the landing, /about and the
// responsible-party block of every legal page.

export interface Company {
  name: string;
  legalStatus: string;
  city: string;
  foundedYear: number;
  domain: string;
  address: string;
  contactEmail: string;
}

export interface Founder {
  name: string;
  shortName: string;
  role: string;
  linkedin: string;
}

export const COMPANY: Company = {
  name: 'Mourly',
  legalStatus: 'Sociedad por acciones simplificada en constitución',
  city: 'Medellín, Colombia',
  foundedYear: 2026,
  domain: 'mourly.com',
  // Ley 1581 asks for a physical address in the habeas data notice; the line
  // is omitted while this is empty. Publish the address declared to the
  // Cámara de Comercio once the SAS is registered.
  address: '',
  contactEmail: 'cloud@mourly.com',
};

export const FOUNDERS: readonly Founder[] = [
  {
    name: 'Jerónimo Campuzano Castaño',
    shortName: 'Jerónimo Campuzano',
    role: 'CEO',
    linkedin: 'https://www.linkedin.com/in/jeronimo-campuzano-casta%C3%B1o/',
  },
  {
    name: 'Juan Esteban Trujillo Montes',
    shortName: 'Juan Esteban Trujillo',
    role: 'CTO',
    linkedin: 'https://www.linkedin.com/in/juan-esteban-trujillo-montes/',
  },
];
