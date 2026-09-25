import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PhotoCarousel } from './PhotoCarousel';

const PHOTOS = ['https://cdn/a.jpg', 'https://cdn/b.jpg', 'https://cdn/c.jpg'];

const trackOf = (container: HTMLElement) =>
  container.querySelector('[data-track]') as HTMLElement;

describe('PhotoCarousel', () => {
  it('starts on the first photo with only the next arrow enabled', () => {
    render(<PhotoCarousel photos={PHOTOS} name="Miguel" />);

    expect(screen.getByRole('button', { name: 'Foto anterior' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Foto siguiente' })).toHaveAttribute(
      'aria-disabled',
      'false',
    );
  });

  it('moves forward and back with the arrows', () => {
    const { container } = render(<PhotoCarousel photos={PHOTOS} name="Miguel" />);

    fireEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }));
    expect(trackOf(container).style.transform).toBe('translateX(-100%)');

    fireEvent.click(screen.getByRole('button', { name: 'Foto anterior' }));
    expect(trackOf(container).style.transform).toBe('translateX(0%)');
  });

  it('stops at the last photo', () => {
    const { container } = render(<PhotoCarousel photos={PHOTOS} name="Miguel" />);
    const next = screen.getByRole('button', { name: 'Foto siguiente' });

    fireEvent.click(next);
    fireEvent.click(next);

    expect(next).toHaveAttribute('aria-disabled', 'true');
    expect(trackOf(container).style.transform).toBe('translateX(-200%)');
  });

  // A disabled button drops focus to <body>; aria-disabled keeps it in place.
  it('keeps the arrow focusable when it reaches the last photo', () => {
    render(<PhotoCarousel photos={PHOTOS} name="Miguel" />);
    const next = screen.getByRole('button', { name: 'Foto siguiente' });

    fireEvent.click(next);
    fireEvent.click(next);

    expect(next).not.toBeDisabled();
  });

  // An inset shadow paints under the photos; the ring rides on ::after instead.
  it('draws its focus ring on a layer above the photos', () => {
    render(<PhotoCarousel photos={PHOTOS} name="Miguel" />);

    expect(screen.getByRole('group').className).toContain(
      'focus-visible:after:ring-inset',
    );
  });

  // A scroll that starts on the photo ends in pointercancel; its start must
  // not turn the next arrow tap into a backwards swipe.
  it('forgets a cancelled swipe before the next arrow tap', () => {
    const { container } = render(<PhotoCarousel photos={PHOTOS} name="Miguel" />);
    const group = screen.getByRole('group');
    const next = screen.getByRole('button', { name: 'Foto siguiente' });
    fireEvent.click(next);

    fireEvent.pointerDown(group, { clientX: 50 });
    fireEvent.pointerCancel(group);
    fireEvent.pointerDown(next, { clientX: 350 });
    fireEvent.pointerUp(next, { clientX: 350 });
    fireEvent.click(next);

    expect(trackOf(container).style.transform).toBe('translateX(-200%)');
  });

  it('moves with the arrow keys', () => {
    const { container } = render(<PhotoCarousel photos={PHOTOS} name="Miguel" />);

    fireEvent.keyDown(screen.getByRole('group'), { key: 'ArrowRight' });

    expect(trackOf(container).style.transform).toBe('translateX(-100%)');
  });

  it('changes photo on a horizontal swipe', () => {
    const { container } = render(<PhotoCarousel photos={PHOTOS} name="Miguel" />);
    const group = screen.getByRole('group');

    fireEvent.pointerDown(group, { clientX: 220 });
    fireEvent.pointerUp(group, { clientX: 120 });

    expect(trackOf(container).style.transform).toBe('translateX(-100%)');
  });

  it('shows no arrows or bars with a single photo', () => {
    const { container } = render(
      <PhotoCarousel photos={['https://cdn/a.jpg']} name="Miguel" />,
    );

    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector('[data-segment]')).toBeNull();
  });

  it('shows the blurred stand-in when there are no photos', () => {
    const { container } = render(<PhotoCarousel photos={[]} name="Miguel" />);

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
