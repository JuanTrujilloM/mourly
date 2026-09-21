import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RotatingWords } from './RotatingWords';

const WORDS = ['scroll.', 'perfiles falsos.', 'chat de tres semanas.'] as const;

describe('RotatingWords', () => {
  it('gives assistive tech the whole sentence instead of the rotating slot', () => {
    render(<RotatingWords prefix="Sin" words={WORDS} />);

    expect(
      screen.getByText('Sin scroll. Sin perfiles falsos. Sin chat de tres semanas.'),
    ).toBeInTheDocument();
    expect(screen.getByText('perfiles falsos.').closest('[aria-hidden]')).not.toBeNull();
  });

  it('staggers each word by one slot so they never overlap', () => {
    render(<RotatingWords prefix="Sin" words={WORDS} />);

    const delays = WORDS.map((word) => screen.getByText(word).style.animationDelay);

    expect(delays).toEqual(['0s', '2.5s', '5s']);
  });
});
