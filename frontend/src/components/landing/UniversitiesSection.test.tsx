import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UniversitiesSection } from './UniversitiesSection';

describe('UniversitiesSection', () => {
  it('frames the universities as verified communities, not partners', () => {
    render(<UniversitiesSection />);

    expect(screen.getByText('Estudiantes verificados de')).toBeInTheDocument();
  });

  it('shows one badge per launch university', () => {
    render(<UniversitiesSection />);

    const badges = screen.getAllByRole('listitem').map((item) => item.textContent);

    expect(badges).toEqual(['EAFIT', 'UPB', 'CES', 'EIA']);
  });
});
