import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FirstDateSection } from './FirstDateSection';

describe('FirstDateSection', () => {
  it('states the date window the availability page offers', () => {
    render(<FirstDateSection />);

    expect(
      screen.getByRole('heading', { name: 'Sabés con quién, dónde y a qué hora.' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/de 12:00 pm a 7:00 pm, de una hora/)).toBeInTheDocument();
  });

  it('shows a sample departure board with place, day and hour', () => {
    render(<FirstDateSection />);

    expect(screen.getByText('Cerca de tu U')).toBeInTheDocument();
    expect(screen.getByText('4:00 p. m.')).toBeInTheDocument();
    expect(screen.getByText('Confirmada')).toBeInTheDocument();
  });

  it('describes the place without naming venues as partners', () => {
    render(<FirstDateSection />);

    expect(screen.getByText('En un lugar que ya conocés.')).toBeInTheDocument();
    expect(screen.queryByText(/aliad/)).not.toBeInTheDocument();
  });
});
