'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { Logo } from '@/components/shared/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { REVEAL_MS, useRevealSteps } from '@/hooks/useRevealSteps';
import { formatSemester } from '@/lib/utils/format';
import type { OpenFlowProfile } from '@/types/flow-profile';
import { CommonGroundSign } from './CommonGroundSign';
import { PhotoCarousel } from './PhotoCarousel';

const ENTER = 'ease-brand transition-[opacity,translate] motion-reduce:transition-none';

// A piece that fades in at its step of the reveal. Until then it is inert, so
// a tap on the hidden button cannot leave the page halfway through. It goes on
// the element itself: a translated wrapper would become the containing block
// of the absolute labels over the photo.
function enter(
  visible: boolean,
  ms: number,
  classes: string,
  hidden = 'translate-y-2',
) {
  return {
    className: `${ENTER} ${visible ? 'translate-x-0 translate-y-0 opacity-100' : `opacity-0 ${hidden}`} ${classes}`,
    style: { transitionDuration: `${ms}ms` } satisfies CSSProperties,
    inert: !visible,
  };
}

// The screen behind the match SMS: who the person is, before any place or
// hour. It says "plan", never "cita"; the button is the only way forward.
// With `reveal`, the landing's blurred countdown card comes into focus first
// (dot, card, focus, rest); a tap anywhere skips to the end.
export function FlowProfile({
  token,
  view,
  reveal = false,
}: {
  token: string;
  view: OpenFlowProfile;
  reveal?: boolean;
}) {
  const { partner, sharedHobbies, otherHobbies, step } = view;
  const next = step === 'VENUE' ? `/flow/${token}/places` : `/availability/${token}`;
  const { step: revealStep, skip } = useRevealSteps(reveal);
  const [dotGrown, setDotGrown] = useState(false);

  useEffect(() => {
    if (!reveal) return;
    const frame = requestAnimationFrame(() => setDotGrown(true));
    return () => cancelAnimationFrame(frame);
  }, [reveal]);

  const cardIn = revealStep !== 'dot';
  const blurred = revealStep === 'dot' || revealStep === 'card';
  const restIn = revealStep === 'rest' || revealStep === 'done';
  const card = (classes = '') => enter(cardIn, REVEAL_MS.card, classes);
  const rest = (classes = '', hidden?: string) =>
    enter(restIn, REVEAL_MS.rest, classes, hidden);

  return (
    <div
      data-reveal-step={revealStep}
      onPointerDown={revealStep === 'done' ? undefined : skip}
      className="flex flex-col gap-4"
    >
      <div {...card()}>
        <div className="flex items-center justify-between">
          <Logo />
          <span className="label border-line bg-surface text-ink-2 inline-flex h-7 items-center rounded-full border px-3">
            Esta semana
          </span>
        </div>
        <div aria-hidden className="feria-stripe mt-4" />
      </div>

      <div {...card()}>
        <div className="space-y-2">
          <p className="label text-ink-3">Alguien de {partner.university}</p>
          <h1 className="display text-ink text-[42px]">
            Conocé a {partner.firstName}
          </h1>
        </div>
      </div>

      {/* The shadow lives on this wrapper: the carousel's clip mask would cut it. */}
      <div className="relative mr-2 mb-3">
        <div {...card()}>
          <div className="border-rotulo-crema rounded-[22px] border-[5px] shadow-[8px_8px_0_var(--color-magenta-600)]">
            <PhotoCarousel
              photos={partner.photos}
              name={partner.firstName}
              blurred={blurred}
              controlsHidden={!restIn}
            />
          </div>
        </div>
        {reveal && (
          <span
            data-reveal-dot
            aria-hidden
            className="bg-accent shadow-glow ease-brand pointer-events-none absolute top-1/2 left-1/2 z-20 -mt-[9px] -ml-[9px] h-[18px] w-[18px] rounded-full transition-[opacity,scale]"
            style={{
              opacity: revealStep === 'dot' ? 1 : 0,
              scale: dotGrown ? '1.5' : '0.6',
              transitionDuration: `${revealStep === 'dot' ? REVEAL_MS.dot : REVEAL_MS.card}ms`,
            }}
          />
        )}
        <p
          {...rest(
            'rotulo bg-magenta-600 text-rotulo-crema absolute bottom-5 -left-2.5 z-10 rounded-[4px_14px_14px_4px] px-4 pt-[7px] pb-1.5 text-[19px] shadow-[4px_4px_0_rgba(0,0,0,0.45)]',
            '-translate-x-3.5',
          )}
        >
          {partner.firstName}, {partner.age}
        </p>
        <p
          {...rest(
            'bg-medianoche/60 border-blanco/20 text-blanco absolute top-7 right-3 z-10 max-w-[calc(100%-24px)] truncate rounded-full border px-3 py-1.5 text-xs font-bold',
          )}
        >
          {partner.major} · {partner.university} ·{' '}
          {formatSemester(partner.semester)}
        </p>
      </div>

      <div {...rest('flex flex-col gap-4')}>
        <CommonGroundSign hobbies={sharedHobbies} />

        {partner.biography && (
          <p className="human text-ink text-[19px]">“{partner.biography}”</p>
        )}

        {otherHobbies.length > 0 && (
          <p className="text-ink-2 text-sm">
            <span className="rotulo text-rotulo-amarillo mr-1.5 text-[11px] tracking-[0.04em]">
              También
            </span>
            <span>{otherHobbies.join(' · ')}</span>
          </p>
        )}
      </div>

      <div
        {...rest(
          'glass-bar border-line sticky bottom-0 -mx-5 mt-2 border-t px-5 py-4 sm:-mx-7 sm:px-7',
        )}
      >
        <ButtonLink href={next} className="w-full">
          Cuadrar el plan
        </ButtonLink>
      </div>
    </div>
  );
}
