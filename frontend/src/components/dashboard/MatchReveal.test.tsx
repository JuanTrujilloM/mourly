import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CurrentMatch } from '@/types/match';
import { MatchReveal } from './MatchReveal';

const MATCH: CurrentMatch = {
  id: 'match-1',
  status: 'PENDING',
  partner: {
    name: 'Sofía',
    age: 21,
    university: 'EAFIT',
    major: 'Diseño',
    biography: 'Café y montaña',
    photoUrl: null,
  },
};

describe('MatchReveal', () => {
  it('renders outside a transformed ancestor so it covers the whole screen', () => {
    const { container } = render(
      <div style={{ transform: 'translateX(-100%)' }}>
        <MatchReveal match={MATCH} onDone={vi.fn()} />
      </div>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Tu plan de esta semana' });
    expect(container.contains(dialog)).toBe(false);
    expect(dialog.parentElement).toBe(document.body);
  });
});
