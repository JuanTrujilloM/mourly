import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AboutSection } from './AboutSection';

describe('AboutSection', () => {
  it('names the founders and the city', () => {
    render(<AboutSection />);

    expect(
      screen.getByText(/Jerónimo Campuzano y Juan Esteban Trujillo/),
    ).toBeInTheDocument();
    expect(screen.getByText(/sede en Medellín/)).toBeInTheDocument();
  });

  it('links to the about page', () => {
    render(<AboutSection />);

    expect(screen.getByRole('link', { name: 'Sobre Mourly' })).toHaveAttribute(
      'href',
      '/about',
    );
  });
});
