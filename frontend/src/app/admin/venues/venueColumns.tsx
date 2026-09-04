'use client';

import type { Column } from '@/components/admin/DataTable';
import { Toggle } from '@/components/ui/Toggle';
import { formatCOP } from '@/lib/utils/format';
import type { Venue } from '@/types/venue';

export function venueColumns(
  onEdit: (venue: Venue) => void,
  onToggle: (venue: Venue, active: boolean) => void,
  togglingId: string | null,
): Column<Venue>[] {
  return [
    {
      header: 'Lugar',
      cell: (venue) => (
        <span className="text-ink font-medium">{venue.name}</span>
      ),
    },
    {
      header: 'Tipo',
      cell: (venue) => <span className="text-ink">{venue.type}</span>,
    },
    {
      header: 'Dirección',
      cell: (venue) => (
        <span className="text-ink-2 block max-w-[200px] truncate text-xs">
          {venue.address}
        </span>
      ),
    },
    {
      header: 'Gasto prom.',
      className: 'text-right',
      cell: (venue) => (
        <span className="text-ink tabular-nums">
          {formatCOP(venue.averageSpentPerPerson)}
        </span>
      ),
    },
    {
      header: 'Comisión',
      className: 'text-right',
      cell: (venue) => (
        <span className="text-ink tabular-nums">
          {Math.round(venue.commissionRate * 100)}%
        </span>
      ),
    },
    {
      header: 'Etiquetas',
      cell: (venue) => (
        <span className="text-ink-2 block max-w-[12rem] truncate text-xs">
          {venue.tags.length ? venue.tags.join(' · ') : '—'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      className: 'text-right',
      cell: (venue) => (
        <div className="flex items-center justify-end gap-4">
          <Toggle
            checked={venue.active}
            disabled={togglingId === venue.id}
            onChange={(next) => onToggle(venue, next)}
          />
          <button
            onClick={() => onEdit(venue)}
            className="text-ink text-xs font-medium whitespace-nowrap underline underline-offset-2 transition"
          >
            Editar
          </button>
        </div>
      ),
    },
  ];
}
