'use client';

import type { Column } from '@/components/admin/DataTable';
import { Toggle } from '@/components/admin/Toggle';
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
        <span className="text-cream font-medium">{venue.name}</span>
      ),
    },
    {
      header: 'Tipo',
      cell: (venue) => <span className="text-cream">{venue.type}</span>,
    },
    {
      header: 'Dirección',
      cell: (venue) => (
        <span className="text-slate block max-w-[200px] truncate text-xs">
          {venue.address}
        </span>
      ),
    },
    {
      header: 'Gasto prom.',
      className: 'text-right',
      cell: (venue) => (
        <span className="text-cream">
          {formatCOP(venue.averageSpentPerPerson)}
        </span>
      ),
    },
    {
      header: 'Comisión',
      className: 'text-right',
      cell: (venue) => (
        <span className="text-cream">
          {Math.round(venue.commissionRate * 100)}%
        </span>
      ),
    },
    {
      header: 'Etiquetas',
      cell: (venue) => (
        <span className="text-slate/80 block max-w-[12rem] truncate text-xs">
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
            className="text-cyan hover:text-cyan/80 text-xs font-medium whitespace-nowrap transition"
          >
            Editar
          </button>
        </div>
      ),
    },
  ];
}
