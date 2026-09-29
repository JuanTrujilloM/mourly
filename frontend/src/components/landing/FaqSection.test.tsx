import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FaqSection } from './FaqSection';

const detailsOf = (question: string) =>
  screen.getByText(question).closest('details') as HTMLDetailsElement;

describe('FaqSection', () => {
  it('answers the three objections from the survey, collapsed', () => {
    const { container } = render(<FaqSection />);

    const items = container.querySelectorAll('details');
    expect(items).toHaveLength(3);
    items.forEach((item) => expect(item.open).toBe(false));
  });

  it('opens an answer when its question is clicked', () => {
    render(<FaqSection />);

    fireEvent.click(screen.getByText('¿Y si no me convence?'));

    expect(detailsOf('¿Y si no me convence?').open).toBe(true);
    expect(detailsOf('¿Qué verifican?').open).toBe(false);
  });

  it('matches the backend match timeout of 48 hours', () => {
    render(<FaqSection />);

    expect(screen.getByText(/a las 48 horas el match se cierra solo/)).toBeInTheDocument();
  });

  it('describes verification as process, not a safety promise', () => {
    render(<FaqSection />);

    expect(screen.getByText(/No revisamos antecedentes/)).toBeInTheDocument();
    expect(screen.queryByText(/segur/i)).not.toBeInTheDocument();
  });
});
