import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommonGroundSign } from './CommonGroundSign';

describe('CommonGroundSign', () => {
  it('points at what both people like', () => {
    render(<CommonGroundSign hobbies={['Teatro', 'Cine']} />);

    expect(
      screen.getByText('A los dos les gusta: Teatro · Cine'),
    ).toBeInTheDocument();
  });

  it('renders nothing when they share no hobby', () => {
    const { container } = render(<CommonGroundSign hobbies={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
