import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
  // 26 sept, 7:00 p. m. in Colombia.
  closesAt: '2026-09-27T00:00:00.000Z',
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
    expect(screen.getByText(/Después elegís lugar y hora\./)).toBeInTheDocument();
  });

  it('sends a link that already has places straight to the hours', () => {
    render(<FlowProfile token="tok" view={{ ...VIEW, step: 'AVAILABILITY' }} />);

    expect(screen.getByRole('link', { name: 'Cuadrar el plan' })).toHaveAttribute(
      'href',
      '/availability/tok',
    );
    expect(screen.getByText(/Después marcás la hora\./)).toBeInTheDocument();
  });

  it('says when the match closes on its own', () => {
    render(<FlowProfile token="tok" view={VIEW} />);

    expect(
      screen.getByText(/Si no hacés nada, se cierra solo el sáb 26 sept a las 7:00 p\. m\./),
    ).toBeInTheDocument();
  });

  it('ends the closing line with a single period after the hour', () => {
    render(<FlowProfile token="tok" view={VIEW} />);

    const line = screen.getByText(/se cierra solo/);
    expect(line.textContent).toMatch(/7:00 p\. m\.$/);
    expect(line.textContent).not.toMatch(/\.\.$/);
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
});
