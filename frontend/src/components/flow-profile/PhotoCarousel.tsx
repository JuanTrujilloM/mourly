'use client';

import { useRef, useState } from 'react';
import { BlurredFigures } from '@/components/shared/BlurredFigures';
import { REVEAL_MS } from '@/hooks/useRevealSteps';

// One color per photo, cycling through the feria stripe.
const SEGMENT_COLORS = ['bg-rotulo-amarillo', 'bg-magenta-500', 'bg-azul-400'];
const SWIPE_THRESHOLD_PX = 40;
const ARROW_PATHS = { prev: 'M15 5l-7 7 7 7', next: 'M9 5l7 7-7 7' } as const;

// Photos change only when the person asks: an arrow, a swipe or an arrow key,
// never a timer. The arrows blur what slides underneath them (brand rule).
// During the reveal the photos start blurred, like the landing's countdown
// card, and the arrows wait until the rest of the profile arrives.
export function PhotoCarousel({
  photos,
  name,
  blurred = false,
  controlsHidden = false,
}: {
  photos: string[];
  name: string;
  blurred?: boolean;
  controlsHidden?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const swipeStart = useRef<number | null>(null);
  const count = photos.length;
  const show = (to: number) => setIndex(Math.max(0, Math.min(count - 1, to)));

  if (count === 0) {
    return (
      <div className="bg-grafito clip-rounded relative aspect-[4/5] rounded-[17px]">
        <BlurredFigures className="h-full w-full" />
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-roledescription="carrusel"
      aria-label={`Fotos de ${name}`}
      tabIndex={count > 1 ? 0 : undefined}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') show(index + 1);
        if (event.key === 'ArrowLeft') show(index - 1);
      }}
      // A press on an arrow is a tap, not the start of a swipe.
      onPointerDown={(event) => {
        swipeStart.current = (event.target as HTMLElement).closest('button')
          ? null
          : event.clientX;
      }}
      // A scroll that starts on the photo ends here, not in pointerup.
      onPointerCancel={() => {
        swipeStart.current = null;
      }}
      onPointerUp={(event) => {
        if (swipeStart.current === null) return;
        const distance = event.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(distance) > SWIPE_THRESHOLD_PX) {
          show(index + (distance < 0 ? 1 : -1));
        }
      }}
      // clip-rounded masks anything outside the box and an inset shadow paints
      // under the photos, so the focus ring rides on ::after, above them.
      className="bg-grafito clip-rounded focus-visible:after:ring-accent relative aspect-[4/5] touch-pan-y rounded-[17px] select-none focus-visible:outline-none focus-visible:after:pointer-events-none focus-visible:after:absolute focus-visible:after:inset-0 focus-visible:after:z-10 focus-visible:after:rounded-[inherit] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:content-['']"
    >
      <div
        data-blurred={blurred}
        className={`ease-brand h-full transition-[filter,scale] motion-reduce:transition-none ${
          blurred ? 'scale-[1.06] blur-lg' : ''
        }`}
        style={{ transitionDuration: `${REVEAL_MS.focus}ms` }}
      >
        <div
          data-track
          className="ease-brand flex h-full transition-transform duration-(--dur-slow) motion-reduce:transition-none"
          style={{ transform: `translateX(${-index * 100}%)` }}
        >
          {photos.map((url, photoIndex) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${photoIndex}-${url}`}
              src={url}
              alt={`Foto ${photoIndex + 1} de ${count} de ${name}`}
              aria-hidden={photoIndex !== index}
              draggable={false}
              className="h-full w-full shrink-0 object-cover"
            />
          ))}
        </div>
      </div>
      <div
        aria-hidden
        className={`from-medianoche/25 to-medianoche/80 pointer-events-none absolute inset-0 bg-linear-to-b transition-opacity motion-reduce:transition-none ${
          blurred ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDuration: `${REVEAL_MS.focus}ms` }}
      />

      {count > 1 && (
        <div
          inert={controlsHidden}
          className={`transition-opacity motion-reduce:transition-none ${
            controlsHidden ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ transitionDuration: `${REVEAL_MS.rest}ms` }}
        >
          <div aria-hidden className="absolute inset-x-3 top-3 flex gap-1.5">
            {photos.map((url, photoIndex) => (
              <span
                key={`${photoIndex}-${url}`}
                data-segment
                className={`h-[3px] flex-1 rounded-full ${
                  photoIndex === index
                    ? SEGMENT_COLORS[photoIndex % SEGMENT_COLORS.length]
                    : 'bg-blanco/35'
                }`}
              />
            ))}
          </div>
          <ArrowButton
            direction="prev"
            disabled={index === 0}
            onClick={() => show(index - 1)}
          />
          <ArrowButton
            direction="next"
            disabled={index === count - 1}
            onClick={() => show(index + 1)}
          />
        </div>
      )}
    </div>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      // aria-disabled, not disabled: a disabled button would drop focus to <body>.
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      aria-label={direction === 'prev' ? 'Foto anterior' : 'Foto siguiente'}
      className={`bg-medianoche/45 border-blanco/20 text-blanco absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition aria-disabled:cursor-default aria-disabled:opacity-30 ${
        direction === 'prev' ? 'left-2.5' : 'right-2.5'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={ARROW_PATHS[direction]} />
      </svg>
    </button>
  );
}
