import { describe, expect, it } from 'vitest';
import { responsibleSection } from './responsible';

const COMPANY = {
  name: 'Mourly',
  legalStatus: 'Sociedad en constitución',
  city: 'Medellín, Colombia',
  address: '',
  contactEmail: 'cloud@mourly.com',
};

const FOUNDERS = [
  { name: 'Ana Pérez', role: 'CEO' },
  { name: 'Luis Gómez', role: 'CTO' },
];

describe('responsibleSection', () => {
  it('names the founders as the responsible parties while the company is being incorporated', () => {
    const section = responsibleSection(COMPANY, FOUNDERS);

    expect(section.bullets).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Ana Pérez'),
        expect.stringContaining('Luis Gómez'),
        expect.stringContaining('Sociedad en constitución'),
        expect.stringContaining('cloud@mourly.com'),
      ]),
    );
  });

  it('omits the address line when no address is set', () => {
    const section = responsibleSection(COMPANY, FOUNDERS);

    expect(section.bullets?.some((line) => line.startsWith('Dirección'))).toBe(
      false,
    );
  });

  it('includes the address line when an address is set', () => {
    const section = responsibleSection(
      { ...COMPANY, address: 'Calle 1 # 2-3' },
      FOUNDERS,
    );

    expect(section.bullets).toContainEqual(
      expect.stringContaining('Calle 1 # 2-3'),
    );
  });
});
