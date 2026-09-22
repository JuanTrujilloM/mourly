'use client';

import { useEffect, useState, type TransitionEvent } from 'react';
import { WORDMARK_PATH } from './Logo';

// Mirror of --dur-base (200 ms) with headroom: unmounts the overlay even when
// transitionend never fires (background tab, transitions disabled).
const FADE_FALLBACK_MS = 400;

// Same outlines as the Logo, minus its circle: the dot here starts at 0,0 and
// offset-path (globals.css, "Splash") laps it around the word back to its home
// at 476.2,-18, so the resting frame is the wordmark exactly. One dot. The
// circle is 45 wide but only its inner 18 is solid: the rest is its halo.
function SplashMark() {
  return (
    <svg
      viewBox="-37 -177 572 246"
      role="img"
      aria-label="mourly"
      className="splash"
    >
      <defs>
        <radialGradient id="splash-dot-halo">
          <stop offset="0.4" stopColor="var(--accent)" />
          <stop offset="0.43" stopColor="var(--accent)" stopOpacity="0.42" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={WORDMARK_PATH} className="fill-ink" />
      <circle
        className="splash-dot"
        fill="url(#splash-dot-halo)"
        cx="0"
        cy="0"
        r="45"
      />
    </svg>
  );
}

// Full-screen so it also covers a layout's own Logo: never two dots on screen.
export function Splash({
  label = 'Cargando',
  fading = false,
  onTransitionEnd,
}: {
  label?: string;
  fading?: boolean;
  onTransitionEnd?: (event: TransitionEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      onTransitionEnd={onTransitionEnd}
      className={`ambient fixed inset-0 z-50 flex items-center justify-center transition-opacity ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <SplashMark />
    </div>
  );
}

// Stays up while `active`; when it drops, fades out instead of cutting the dot
// mid-orbit, and unmounts once the fade ends (or the fallback timer fires).
export function SplashOverlay({
  active,
  label,
}: {
  active: boolean;
  label?: string;
}) {
  const [fadedOut, setFadedOut] = useState(!active);
  const [previousActive, setPreviousActive] = useState(active);

  // Re-arm the fade whenever `active` flips, so a re-shown overlay fades again.
  if (previousActive !== active) {
    setPreviousActive(active);
    setFadedOut(false);
  }

  useEffect(() => {
    if (active) return;
    const timer = setTimeout(() => setFadedOut(true), FADE_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active && fadedOut) return null;

  return (
    <Splash
      label={label}
      fading={!active}
      onTransitionEnd={(event) => {
        // Only the wrapper's own fade counts, not a transition bubbling up.
        if (event.target === event.currentTarget) setFadedOut(true);
      }}
    />
  );
}
