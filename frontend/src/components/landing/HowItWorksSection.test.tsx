import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HowItWorksSection } from './HowItWorksSection';

describe('HowItWorksSection', () => {
  it('draws the steps as stations that end at the date', () => {
    render(<HowItWorksSection />);

    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('Estación 01')).toBeInTheDocument();
    expect(screen.getByText('Destino')).toBeInTheDocument();
    expect(screen.queryByText('Estación 04')).not.toBeInTheDocument();
  });

  it('tells when the match arrives and how long the date lasts', () => {
    render(<HowItWorksSection />);

    expect(screen.getByText(/A las 7:00 pm te avisamos/)).toBeInTheDocument();
    expect(screen.getByText('Un café de una hora, de día')).toBeInTheDocument();
  });
});
