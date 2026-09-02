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
          <span className="text-cream font-medium">{match.userA.name}</span>
          <span className="text-blush mx-1.5">♥</span>
          <span className="text-cream font-medium">{match.userB.name}</span>
          <p className="text-slate mt-0.5 text-xs">
            {match.userA.university} · {match.userB.university}
          </p>
        </div>
      ),
    },
    {
      header: 'Score',
      className: 'text-right',
      cell: (match) => (
        <span className="text-cyan font-semibold">
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
            <span className="text-cream">{match.date.venueName}</span>
            <p className="text-slate mt-0.5 text-xs">
              {formatDateTime(match.date.scheduledAt)}
            </p>
          </div>
        ) : (
          <span className="text-slate">—</span>
        ),
    },
    {
      header: 'Creado',
      cell: (match) => (
        <span className="text-slate text-xs">{formatDate(match.createdAt)}</span>
      ),
    },
    {
      header: '',
      className: 'text-right',
      cell: (match) => (
        <div className="flex justify-end gap-3">
          <Link
            href={`/admin/matches/${match.id}`}
            className="text-cyan hover:text-cyan/80 text-xs font-medium transition"
          >
            Ver
          </Link>
          {CANCELABLE.has(match.status) && (
            <button
              onClick={() => onCancel(match.id)}
              disabled={isCancelling}
              className="text-blush hover:text-blush/80 text-xs font-medium transition disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
        </div>
      ),
    },
  ];
}
