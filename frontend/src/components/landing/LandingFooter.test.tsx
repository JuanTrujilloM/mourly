import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LandingFooter } from './LandingFooter';

describe('LandingFooter', () => {
  it('links each legal page and the about page to its own route', () => {
    render(<LandingFooter />);

    const expected: Record<string, string> = {
      'Sobre Mourly': '/about',
      Términos: '/terminos',
      Privacidad: '/privacidad',
      'Habeas Data': '/habeas-data',
    };

    for (const [label, href] of Object.entries(expected)) {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute(
        'href',
        href,
      );
    }
  });

  it('leaves no dead anchors', () => {
    render(<LandingFooter />);

    const hrefs = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));

    expect(hrefs).not.toContain('#');
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
