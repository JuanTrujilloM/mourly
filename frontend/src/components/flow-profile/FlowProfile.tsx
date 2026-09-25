import { Logo } from '@/components/shared/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { formatSemester } from '@/lib/utils/format';
import type { OpenFlowProfile } from '@/types/flow-profile';
import { CommonGroundSign } from './CommonGroundSign';
import { PhotoCarousel } from './PhotoCarousel';

// The screen behind the match SMS: who the person is, before any place or
// hour. It says "plan", never "cita"; the button is the only way forward.
export function FlowProfile({
  token,
  view,
}: {
  token: string;
  view: OpenFlowProfile;
}) {
  const { partner, sharedHobbies, otherHobbies, step } = view;
  const next = step === 'VENUE' ? `/flow/${token}/places` : `/availability/${token}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Logo />
        <span className="label border-line bg-surface text-ink-2 inline-flex h-7 items-center rounded-full border px-3">
          Esta semana
        </span>
      </div>
      <div aria-hidden className="feria-stripe" />

      <div className="space-y-2">
        <p className="label text-ink-3">Alguien de {partner.university}</p>
        <h1 className="display text-ink text-[42px]">
          Conocé a {partner.firstName}
        </h1>
      </div>

      {/* The shadow lives on this wrapper: the carousel's clip mask would cut it. */}
      <div className="relative mr-2 mb-3">
        <div className="border-rotulo-crema rounded-[22px] border-[5px] shadow-[8px_8px_0_var(--color-magenta-600)]">
          <PhotoCarousel photos={partner.photos} name={partner.firstName} />
        </div>
        <p className="rotulo bg-magenta-600 text-rotulo-crema absolute bottom-5 -left-2.5 z-10 rounded-[4px_14px_14px_4px] px-4 pt-[7px] pb-1.5 text-[19px] shadow-[4px_4px_0_rgba(0,0,0,0.45)]">
          {partner.firstName}, {partner.age}
        </p>
        <p className="bg-medianoche/60 border-blanco/20 text-blanco absolute top-7 right-3 z-10 max-w-[calc(100%-24px)] truncate rounded-full border px-3 py-1.5 text-xs font-bold">
          {partner.major} · {partner.university} · {formatSemester(partner.semester)}
        </p>
      </div>

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

      <div className="glass-bar border-line sticky bottom-0 -mx-5 mt-2 border-t px-5 py-4 sm:-mx-7 sm:px-7">
        <ButtonLink href={next} className="w-full">
          Cuadrar el plan
        </ButtonLink>
      </div>
    </div>
  );
}
