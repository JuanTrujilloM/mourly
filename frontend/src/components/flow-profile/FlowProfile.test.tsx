import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { REVEAL_MS } from '@/hooks/useRevealSteps';
import type { OpenFlowProfile } from '@/types/flow-profile';
import { FlowProfile } from './FlowProfile';

const VIEW: OpenFlowProfile = {
  step: 'VENUE',
  partner: {
    firstName: 'Miguel',
    age: 24,
    university: 'CES',
    major: 'Psicología',
    semester: '7',
    biography: 'Teatro, cine club y caminatas.',
    photos: ['https://cdn/a.jpg', 'https://cdn/b.jpg'],
  },
  sharedHobbies: ['Teatro'],
  otherHobbies: ['Senderismo', 'Cine'],
};

describe('FlowProfile', () => {
  it('introduces the partner by first name', () => {
    render(<FlowProfile token="tok" view={VIEW} />);

    expect(
      screen.getByRole('heading', { name: 'Conocé a Miguel' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Alguien de CES')).toBeInTheDocument();
    expect(screen.getByText('Miguel, 24')).toBeInTheDocument();
    expect(screen.getByText('Psicología · CES · 7.º sem.')).toBeInTheDocument();
    expect(screen.getByText('A los dos les gusta: Teatro')).toBeInTheDocument();
    expect(screen.getByText('“Teatro, cine club y caminatas.”')).toBeInTheDocument();
  });

  it('sends a link still choosing places to the places step', () => {
    render(<FlowProfile token="tok" view={VIEW} />);

    expect(screen.getByRole('link', { name: 'Cuadrar el plan' })).toHaveAttribute(
      'href',
      '/flow/tok/places',
    );
  });

  it('sends a link that already has places straight to the hours', () => {
    render(<FlowProfile token="tok" view={{ ...VIEW, step: 'AVAILABILITY' }} />);

    expect(screen.getByRole('link', { name: 'Cuadrar el plan' })).toHaveAttribute(
      'href',
      '/availability/tok',
    );
  });

  it("lists the partner's other hobbies under También", () => {
    render(<FlowProfile token="tok" view={VIEW} />);

    expect(screen.getByText('También')).toBeInTheDocument();
    expect(screen.getByText('Senderismo · Cine')).toBeInTheDocument();
  });

  it('leaves También out when every hobby is shared', () => {
    render(<FlowProfile token="tok" view={{ ...VIEW, otherHobbies: [] }} />);

    expect(screen.queryByText('También')).toBeNull();
  });

  it('adds no line under the button', () => {
    render(<FlowProfile token="tok" view={VIEW} />);

    expect(screen.queryByText(/Después/)).toBeNull();
    expect(screen.queryByText(/se cierra solo/)).toBeNull();
  });

  it('leaves the bio out when it is empty', () => {
    render(
      <FlowProfile
        token="tok"
        view={{ ...VIEW, partner: { ...VIEW.partner, biography: '' } }}
      />,
    );

    expect(screen.queryByText(/“/)).toBeNull();
  });

  it('never calls it a date', () => {
    render(<FlowProfile token="tok" view={VIEW} />);

    expect(screen.queryByText(/cita/i)).toBeNull();
  });

  describe('reveal', () => {
    const TOTAL = Object.values(REVEAL_MS).reduce((sum, ms) => sum + ms, 0);
    const stepOf = (container: HTMLElement) =>
      container.querySelector('[data-reveal-step]')?.getAttribute('data-reveal-step');

    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows the profile at once without the reveal', () => {
      const { container } = render(<FlowProfile token="tok" view={VIEW} />);

      expect(stepOf(container)).toBe('done');
      expect(container.querySelector('[data-reveal-dot]')).toBeNull();
    });

    it('opens on the dot and keeps the button out of reach', () => {
      vi.useFakeTimers();
      const { container } = render(<FlowProfile token="tok" view={VIEW} reveal />);

      expect(stepOf(container)).toBe('dot');
      expect(container.querySelector('[data-reveal-dot]')).not.toBeNull();
      expect(
        screen.getByRole('link', { name: 'Cuadrar el plan', hidden: true }).closest('[inert]'),
      ).not.toBeNull();
    });

    it('ends with the full profile after 1.45 s', () => {
      vi.useFakeTimers();
      const { container } = render(<FlowProfile token="tok" view={VIEW} reveal />);

      act(() => vi.advanceTimersByTime(TOTAL));

      expect(stepOf(container)).toBe('done');
      expect(
        screen.getByRole('link', { name: 'Cuadrar el plan' }).closest('[inert]'),
      ).toBeNull();
    });

    it('skips to the full profile on a tap', () => {
      vi.useFakeTimers();
      const { container } = render(<FlowProfile token="tok" view={VIEW} reveal />);

      fireEvent.pointerDown(container.querySelector('[data-reveal-step]') as HTMLElement);

      expect(stepOf(container)).toBe('done');
    });
  });
});
