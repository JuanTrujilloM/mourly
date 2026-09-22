// Geometry in the 350-wide drawing: two lines leave their own stations, bend
// 45° into a shared track, stop at what both like and end at the venue.
const SHARED_TRACK_TOP = 178;
const STATION_GAP = 24;
const TERMINAL_GAP = 37;
// The venue name sits centered under the terminal: beside it a long name
// ("Crepes & Waffles Las Vegas") would run off the drawing.
const TERMINAL_LABELS_HEIGHT = 70;

function stationY(index: number): number {
  return SHARED_TRACK_TOP + 14 + index * STATION_GAP;
}

export function LinesDiagram({
  viewerLine,
  partnerName,
  partnerLine,
  sharedHobbies,
  venueName,
  whenText,
}: {
  viewerLine: string;
  partnerName: string;
  partnerLine: string;
  sharedHobbies: string[];
  venueName: string;
  whenText: string;
}) {
  const stops = Math.max(sharedHobbies.length, 1);
  const terminalY = stationY(stops - 1) + TERMINAL_GAP;
  const trackEnd = terminalY - 15;
  const height = terminalY + TERMINAL_LABELS_HEIGHT;

  const spoken =
    `Tu línea y la de ${partnerName} se encuentran en ${venueName}, ${whenText}.` +
    (sharedHobbies.length
      ? ` Comparten: ${sharedHobbies.join(', ')}.`
      : '');

  return (
    <svg
      viewBox={`0 0 350 ${height}`}
      role="img"
      aria-label={spoken}
      className="block h-auto w-full"
    >
      <path
        d={`M52 28V64L166 ${SHARED_TRACK_TOP}V${trackEnd}`}
        className="stroke-azul-400"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M298 28V64L184 ${SHARED_TRACK_TOP}V${trackEnd}`}
        className="stroke-accent"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="52" cy="28" r="9" className="fill-medianoche stroke-blanco" strokeWidth="3.5" />
      <circle cx="298" cy="28" r="9" className="fill-medianoche stroke-blanco" strokeWidth="3.5" />

      <text x="70" y="25" className="fill-blanco text-[16px] font-bold">
        Vos
      </text>
      <text x="70" y="42" className="fill-azul-400 text-[12.5px] font-semibold">
        {viewerLine}
      </text>
      <text x="280" y="25" textAnchor="end" className="fill-blanco text-[16px] font-bold">
        {partnerName}
      </text>
      <text x="280" y="42" textAnchor="end" className="fill-magenta-300 text-[12.5px] font-semibold">
        {partnerLine}
      </text>

      {sharedHobbies.map((hobby, index) => (
        <g key={hobby}>
          <rect
            x="158"
            y={stationY(index) - 7}
            width="34"
            height="14"
            rx="7"
            className="fill-medianoche stroke-blanco"
            strokeWidth="3"
          />
          <text x="206" y={stationY(index) + 5} className="fill-hielo-2 text-[14.5px] font-medium">
            {hobby}
          </text>
        </g>
      ))}
      {sharedHobbies.length > 0 && (
        <text
          x="144"
          y={stationY((sharedHobbies.length - 1) / 2) + 4}
          textAnchor="end"
          className="fill-ink-3 text-[12.5px]"
        >
          lo que comparten
        </text>
      )}

      <circle cx="175" cy={terminalY} r="15" className="fill-medianoche stroke-blanco" strokeWidth="5" />
      <circle cx="175" cy={terminalY} r="5.5" className="fill-accent" />
      <text
        x="175"
        y={terminalY + 42}
        textAnchor="middle"
        className="display fill-blanco text-[22px]"
      >
        {venueName}
      </text>
      <text
        x="175"
        y={terminalY + 61}
        textAnchor="middle"
        className="fill-hielo-2 text-[13px]"
      >
        {whenText}
      </text>
    </svg>
  );
}
