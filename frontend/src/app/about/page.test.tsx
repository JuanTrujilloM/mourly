import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FOUNDERS } from '@/lib/constants/company';
import AboutPage from './page';

describe('AboutPage', () => {
  it('states in English that Mourly is a Medellín technology startup', () => {
    render(<AboutPage />);

    expect(
      screen.getByText(/Medellín-based technology startup/),
    ).toBeInTheDocument();
  });

  it('presents each founder with full name, role and LinkedIn', () => {
    render(<AboutPage />);

    for (const founder of FOUNDERS) {
      expect(screen.getByText(founder.name)).toBeInTheDocument();
      expect(screen.getByText(founder.role)).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: `LinkedIn de ${founder.name}` }),
      ).toHaveAttribute('href', founder.linkedin);
    }
  });

  it('names the company as Mourly S.A.S. with registration in progress', () => {
    render(<AboutPage />);

    expect(screen.getByText(/Mourly S\.A\.S\./)).toBeInTheDocument();
    expect(screen.getByText(/Registro en proceso/)).toBeInTheDocument();
  });

  it('exposes the single public mailbox', () => {
    render(<AboutPage />);

    expect(
      screen.getByRole('link', { name: 'cloud@mourly.com' }),
    ).toHaveAttribute('href', 'mailto:cloud@mourly.com');
  });
});
