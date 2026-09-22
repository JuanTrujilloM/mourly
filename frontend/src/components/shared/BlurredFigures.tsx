// Stand-in for a photograph: flat figures under the ground's cool light, meant
// to be seen only through a heavy blur. Built from ellipses and paths (no
// <circle>): the countdown card owns the single circle on screen, its dot.
const LONG_HAIR_BACK =
  'M80 212C70 112 118 94 150 94s82 16 70 118c4 50 16 90 26 120H54c10-30 22-70 26-120z';
const LONG_HAIR_FRINGE =
  'M93 182c2-50 34-70 62-68 30 2 53 26 52 68-16-16-36-32-67-36-20 4-38 18-47 36z';
const SHORT_HAIR =
  'M90 184c-6-60 32-82 62-82 32 0 66 22 58 84-8-24-24-42-60-44-30 0-50 18-60 42z';
const SHOULDERS = 'M22 400C30 318 92 296 150 296s120 22 128 104z';
const NECK = 'M126 240h48v50c0 14-11 24-24 24s-24-10-24-24z';

function Figure({
  transform,
  longHair,
  skin,
  cloth,
}: {
  transform: string;
  longHair: boolean;
  skin: string;
  cloth: string;
}) {
  return (
    <g transform={transform}>
      {longHair && <path d={LONG_HAIR_BACK} className="fill-foto-pelo" />}
      <path d={SHOULDERS} className={cloth} />
      <path d={NECK} className="fill-foto-piel-2" />
      <ellipse cx="150" cy="190" rx="57" ry="68" className={skin} />
      <path
        d={longHair ? LONG_HAIR_FRINGE : SHORT_HAIR}
        className="fill-foto-pelo"
      />
    </g>
  );
}

export function BlurredFigures({
  couple = false,
  className = '',
}: {
  couple?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 340 360"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={`block blur-xl ${className}`}
    >
      <defs>
        <linearGradient id="figures-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-foto-fondo)" />
          <stop offset="1" stopColor="var(--color-medianoche)" />
        </linearGradient>
        <radialGradient id="figures-light" cx="0.84" cy="0.1" r="0.8">
          <stop offset="0" stopColor="var(--color-foto-luz)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--color-foto-luz)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="340" height="360" fill="url(#figures-ground)" />
      <rect width="340" height="360" fill="url(#figures-light)" />
      {couple ? (
        <>
          <Figure
            transform="translate(22 14) scale(0.62)"
            longHair
            skin="fill-foto-piel"
            cloth="fill-foto-tela"
          />
          <Figure
            transform="translate(130 -8) scale(0.68)"
            longHair={false}
            skin="fill-foto-piel-2"
            cloth="fill-foto-tela-2"
          />
        </>
      ) : (
        <Figure
          transform="translate(20 -10) scale(1)"
          longHair
          skin="fill-foto-piel"
          cloth="fill-foto-tela"
        />
      )}
    </svg>
  );
}
