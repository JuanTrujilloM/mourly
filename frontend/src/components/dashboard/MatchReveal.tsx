'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { CurrentMatch, MatchPartner } from '@/types/match';

// The one celebration of the week: dot grows (320 ms), name rises (320 ms),
// the sheet slides in (420 ms). The dot fades as the sheet's momento button
// arrives so the screen never holds two mandarina elements.
export function MatchReveal({
  match,
  onDone,
}: {
  match: CurrentMatch;
  onDone: () => void;
}) {
  const partner = match.partner as MatchPartner;
  const [go, setGo] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGo(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tu cita de esta semana"
      className="noche bg-page text-ink fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-7 pb-64 text-center"
    >
      <span
        aria-hidden
        className={`bg-mandarina-500 ease-brand h-[18px] w-[18px] rounded-full transition-[transform,opacity] duration-(--dur-slow) motion-reduce:transition-none ${
          go ? 'scale-150 opacity-0 delay-[720ms]' : ''
        }`}
        style={go ? { transitionDelay: '0ms, 720ms' } : undefined}
      />

      <p
        className={`human text-ink ease-brand mt-6 text-[30px] transition-[opacity,transform] delay-[320ms] duration-(--dur-slow) motion-reduce:transition-none ${
          go ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        {partner.name}, {partner.age}
      </p>

      <p
        className={`human text-ink-2 ease-brand mt-3 text-[18px] transition-opacity delay-[500ms] duration-(--dur-slow) motion-reduce:transition-none ${
          go ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Hola, mor. Esta semana hay alguien para vos.
      </p>

      <div
        className={`dia bg-page text-ink rounded-t-sheet shadow-elevated ease-brand absolute inset-x-0 bottom-0 px-6 pt-6 pb-8 text-left transition-transform delay-[720ms] duration-[420ms] motion-reduce:transition-none ${
          go ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <p className="label text-ink-3">Tu cita · esta semana</p>
        <p className="subheading text-ink mt-2 text-[22px]">
          {partner.major} · {partner.university}
        </p>
        {partner.biography && (
          <p className="human text-ink-2 mt-2 text-[18px]">
            “{partner.biography}”
          </p>
        )}
        <p className="text-ink-2 mt-3 text-sm">
          Te escribimos por WhatsApp para cuadrar día, hora y lugar.
        </p>
        <div className="mt-5">
          <Button variant="momento" onClick={onDone}>
            Ver mi cita
          </Button>
        </div>
      </div>
    </div>
  );
}
