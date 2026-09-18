import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Splash, SplashOverlay } from './Splash';

describe('Splash', () => {
  it('draws the wordmark outlines with a single animated dot', () => {
    const { container } = render(<Splash />);

    expect(container.querySelectorAll('path')).toHaveLength(1);
    const dots = container.querySelectorAll('circle');
    expect(dots).toHaveLength(1);
    expect(dots[0]).toHaveClass('splash-dot');
  });

  it('announces itself as a loading status', () => {
    render(<Splash />);

    expect(
      screen.getByRole('status', { name: 'Cargando' }),
    ).toBeInTheDocument();
  });

  it('exposes a custom label to screen readers', () => {
    render(<Splash label="Cargando tu calendario" />);

    expect(
      screen.getByRole('status', { name: 'Cargando tu calendario' }),
    ).toBeInTheDocument();
  });
});

describe('SplashOverlay', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('stays mounted while active', () => {
    render(<SplashOverlay active />);

    expect(screen.getByRole('status')).toHaveClass('opacity-100');
  });

  it('fades out and unmounts once active turns false', () => {
    const { rerender } = render(<SplashOverlay active />);

    rerender(<SplashOverlay active={false} />);
    const overlay = screen.getByRole('status');
    expect(overlay).toHaveClass('opacity-0');

    fireEvent.transitionEnd(overlay);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('unmounts on the fallback timer when transitionend never fires', () => {
    vi.useFakeTimers();
    const { rerender } = render(<SplashOverlay active />);

    rerender(<SplashOverlay active={false} />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders nothing when mounted already inactive', () => {
    render(<SplashOverlay active={false} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows again, at full opacity, when re-activated after a fade', () => {
    const { rerender } = render(<SplashOverlay active />);

    rerender(<SplashOverlay active={false} />);
    fireEvent.transitionEnd(screen.getByRole('status'));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    rerender(<SplashOverlay active />);

    expect(screen.getByRole('status')).toHaveClass('opacity-100');
  });
});
