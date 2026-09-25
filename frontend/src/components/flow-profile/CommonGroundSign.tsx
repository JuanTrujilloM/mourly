// The Rótulo's yellow arrow sign, pointing at what both people like. Only the
// overlap ever reaches this screen (backend shared-hobbies.ts); a hobby the
// viewer does not have stays private. The body spans 16–84 % of the height and
// the last 44 px are the arrowhead; the dashed lines sit inside the body.
const ARROW_SHAPE =
  '[clip-path:polygon(0_16%,calc(100%-44px)_16%,calc(100%-44px)_0,100%_50%,calc(100%-44px)_100%,calc(100%-44px)_84%,0_84%)]';

export function CommonGroundSign({ hobbies }: { hobbies: string[] }) {
  if (hobbies.length === 0) return null;
  return (
    <p
      className={`rotulo bg-rotulo-amarillo text-rotulo-tinta before:border-rotulo-tinta/70 relative py-4 pr-14 pl-3.5 text-[13px] before:pointer-events-none before:absolute before:inset-y-[calc(16%+5px)] before:right-12 before:left-1.5 before:border-y before:border-dashed before:content-[''] ${ARROW_SHAPE}`}
    >
      A los dos les gusta: {hobbies.join(' · ')}
    </p>
  );
}
