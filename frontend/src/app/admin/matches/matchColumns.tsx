'use client';

import Link from 'next/link';
import type { Column } from '@/components/admin/DataTable';
import { MatchStatusBadge } from '@/components/admin/StatusBadge';
import { formatDate, formatDateTime } from '@/lib/utils/format';
import type { AdminMatch } from '@/types/admin';

const CANCELABLE = new Set(['pending', 'confirmed']);

export function matchColumns(
  onCancel: (id: string) => void,
  isCancelling: boolean,
): Column<AdminMatch>[] {
  return [
    {
      header: 'Pareja',
      cell: (match) => (
        <div>
          <span className="text-ink font-medium">{match.userA.name}</span>
          <span className="text-ink-3 mx-1.5">y</span>
          <span className="text-ink font-medium">{match.userB.name}</span>
          <p className="text-ink-2 mt-0.5 text-xs">
            {match.userA.university} · {match.userB.university}
          </p>
        </div>
      ),
    },
    {
      header: 'Score',
      className: 'text-right',
      cell: (match) => (
        <span className="text-ink font-semibold tabular-nums">
          {match.compatibilityScore.toFixed(1)}
        </span>
      ),
    },
    {
      header: 'Estado',
      cell: (match) => <MatchStatusBadge status={match.status} />,
    },
    {
      header: 'Cita',
      cell: (match) =>
        match.date ? (
          <div>
            <span className="text-ink">{match.date.venueName}</span>
            <p className="text-ink-2 mt-0.5 text-xs">
              {formatDateTime(match.date.scheduledAt)}
            </p>
          </div>
        ) : (
          <span className="text-ink-3">—</span>
        ),
    },
    {
      header: 'Creado',
      cell: (match) => (
        <span className="text-ink-2 text-xs">{formatDate(match.createdAt)}</span>
      ),
    },
    {
      header: '',
      className: 'text-right',
      cell: (match) => (
        <div className="flex justify-end gap-3">
          <Link
            href={`/admin/matches/${match.id}`}
            className="text-ink text-xs font-medium underline underline-offset-2"
          >
            Ver
          </Link>
          {CANCELABLE.has(match.status) && (
            <button
              onClick={() => onCancel(match.id)}
              disabled={isCancelling}
              className="text-ink-3 hover:text-ink text-xs font-medium transition disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
        </div>
      ),
    },
  ];
}
