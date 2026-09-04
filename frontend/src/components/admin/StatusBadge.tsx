// No mandarina in tables: states read through ink, live green and error only.
type Tone = 'pending' | 'confirmed' | 'live' | 'muted' | 'error';

const tones: Record<Tone, string> = {
  pending: 'bg-surface-2 text-ink-2',
  confirmed: 'bg-surface-2 text-ink',
  live: 'bg-surface-2 text-live',
  muted: 'bg-surface-2 text-ink-3',
  error: 'bg-error text-hueso',
};

const MATCH: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Pendiente', tone: 'pending' },
  confirmed: { label: 'Confirmado', tone: 'confirmed' },
  completed: { label: 'Completado', tone: 'live' },
  canceled: { label: 'Cancelado', tone: 'muted' },
};

const USER_STATUS: Record<string, { label: string; tone: Tone }> = {
  SEARCHING: { label: 'Buscando', tone: 'live' },
  PAUSED: { label: 'En pausa', tone: 'muted' },
};

export function Badge({
  label,
  tone = 'muted',
}: {
  label: string;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

export function MatchStatusBadge({ status }: { status: string }) {
  const entry = MATCH[status] ?? { label: status, tone: 'muted' as Tone };
  return <Badge label={entry.label} tone={entry.tone} />;
}

export function UserStatusBadge({ status }: { status: string }) {
  const entry = USER_STATUS[status] ?? { label: status, tone: 'muted' as Tone };
  return <Badge label={entry.label} tone={entry.tone} />;
}
