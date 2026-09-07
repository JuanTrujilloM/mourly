import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { LegalDocument } from '@/lib/legal/types';
import { LegalPage } from './LegalPage';

const DOCUMENT: LegalDocument = {
  title: 'Documento de prueba',
  version: '1.0',
  updatedAt: '2026-09-06',
  sections: [
    { heading: 'Primera', paragraphs: ['Un párrafo.'] },
    { heading: 'Segunda', bullets: ['Un punto', 'Otro punto'] },
  ],
};

describe('LegalPage', () => {
  it('renders the title as the page heading', () => {
    render(<LegalPage document={DOCUMENT} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Documento de prueba' }),
    ).toBeInTheDocument();
  });

  it('renders one heading per section with its paragraphs and bullets', () => {
    render(<LegalPage document={DOCUMENT} />);

    expect(screen.getByRole('heading', { name: 'Primera' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Segunda' })).toBeInTheDocument();
    expect(screen.getByText('Un párrafo.')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(
      expect.arrayContaining(['Un punto', 'Otro punto']),
    );
  });

  it('shows version and date', () => {
    render(<LegalPage document={DOCUMENT} />);

    expect(screen.getByText(/Versión 1\.0/)).toBeInTheDocument();
    expect(screen.getByText(/2026-09-06/)).toBeInTheDocument();
  });
});
