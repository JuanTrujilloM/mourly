import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchCountdown } from './MatchCountdown';

describe('MatchCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Monday noon in Colombia: Thursday 7:00 pm is 3 days and 7 hours away.
    vi.setSystemTime(new Date('2026-09-14T12:00:00-05:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts down to the next Thursday at 7:00 pm', () => {
    render(<MatchCountdown />);

    expect(
      screen.getByRole('timer', {
        name: 'Faltan 3 días, 7 horas y 0 minutos para el próximo match',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('07')).toBeInTheDocument();
    expect(screen.getByText('00')).toBeInTheDocument();
  });

  it('uses the singular for one day, one hour and one minute', () => {
    vi.setSystemTime(new Date('2026-09-16T17:59:00-05:00'));
    render(<MatchCountdown />);

    expect(
      screen.getByRole('timer', {
        name: 'Faltan 1 día, 1 hora y 1 minuto para el próximo match',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('día')).toBeInTheDocument();
    expect(screen.getByText('hora')).toBeInTheDocument();
  });

  it('keeps counting as the minutes pass', () => {
    render(<MatchCountdown />);

    act(() => vi.advanceTimersByTime(60_000));

    expect(screen.getByText('59')).toBeInTheDocument();
    expect(screen.getByText('06')).toBeInTheDocument();
  });

  it('draws a single dot, the one that orbits', () => {
    const { container } = render(<MatchCountdown />);

    const dots = container.querySelectorAll('circle');
    expect(dots).toHaveLength(1);
    expect(dots[0]).toHaveClass('countdown-dot');
  });
});
