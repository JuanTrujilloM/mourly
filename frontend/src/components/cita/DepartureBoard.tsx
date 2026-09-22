export interface BoardRow {
  label: string;
  value: string;
  live?: boolean;
}

// The board has room for 13 tiles beside the label; longer values wrap.
const MAX_TILES_PER_LINE = 13;

function wrapIntoLines(value: string): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of value.toUpperCase().split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && next.length > MAX_TILES_PER_LINE) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.map((text) => text.slice(0, MAX_TILES_PER_LINE));
}

function Flaps({ text, live }: { text: string; live?: boolean }) {
  return (
    <span aria-hidden className="flex gap-0.5">
      {[...text].map((character, index) => (
        <span
          key={index}
          className={`bg-grafito border-line relative flex h-[26px] w-[17px] items-center justify-center rounded border font-[600] text-[17px] leading-none [font-variation-settings:'wdth'_75] ${
            live ? 'text-live' : 'text-ink'
          }`}
        >
          {character === ' ' ? ' ' : character}
          <span className="bg-medianoche-950/70 absolute inset-x-0 top-1/2 h-px" />
        </span>
      ))}
    </span>
  );
}

// A station departure board: split-flap tiles, one row per fact of the date.
// Screen readers get each row as plain text; the tiles are decoration.
export function DepartureBoard({ rows }: { rows: BoardRow[] }) {
  return (
    <dl className="bg-medianoche-950/65 border-line inset-shadow-glass rounded-card space-y-2 border p-3.5">
      {rows.map((row) => (
        <div key={row.label} className="flex items-start gap-2">
          <dt className="label text-ink-3 w-[58px] shrink-0 pt-2">
            {row.label}
          </dt>
          <dd className="space-y-1">
            <span className="sr-only">{row.value}</span>
            {wrapIntoLines(row.value).map((line) => (
              <Flaps key={line} text={line} live={row.live} />
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
