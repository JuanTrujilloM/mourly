import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DateCard } from './DateCard';

describe('DateCard', () => {
  it('shows a portrait for the specimen match', () => {
    render(<DateCard />);

    expect(screen.getByRole('img', { name: /Valentina/ })).toBeInTheDocument();
  });

  it('labels the card as an example so it does not read as a real profile', () => {
    render(<DateCard />);

    expect(screen.getByText('Ejemplo')).toBeInTheDocument();
  });
});
