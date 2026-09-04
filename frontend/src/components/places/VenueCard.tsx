import type { VenueSuggestion } from '@/types/venue';

export function VenueCard({
  venue,
  selected,
  onToggle,
}: {
  venue: VenueSuggestion;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`rounded-card w-full border p-5 text-left transition ${
        selected
          ? 'border-ink bg-verde-100'
          : 'border-line bg-surface hover:border-ink-2'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="subheading text-ink text-[18px]">{venue.name}</h3>
          <span className="text-ink-2 text-xs font-medium">{venue.type}</span>
        </div>
        <span
          aria-hidden
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            selected ? 'border-ink bg-ink text-page' : 'border-line text-transparent'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12l5 5 9-10" />
          </svg>
        </span>
      </div>

      <p className="text-ink-2 mt-2 text-sm">{venue.description}</p>

      <dl className="text-ink-2 mt-3 space-y-1 text-xs">
        <div className="flex gap-2">
          <dt className="text-ink-3 shrink-0">Dirección</dt>
          <dd>{venue.address}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-3 shrink-0">Horario</dt>
          <dd>{venue.openingHours}</dd>
        </div>
      </dl>
    </button>
  );
}
