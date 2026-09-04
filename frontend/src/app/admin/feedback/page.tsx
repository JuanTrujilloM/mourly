'use client';

import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/admin/StatusBadge';
import { Stars } from '@/components/admin/match-comparison/primitives';
import { useAdminFeedback } from '@/hooks/useAdminData';
import { formatCOP, formatDateTime } from '@/lib/utils/format';
import type { AdminFeedback } from '@/types/admin';

export default function AdminFeedbackPage() {
  const { data, isLoading, isError } = useAdminFeedback();

  const columns: Column<AdminFeedback>[] = [
    {
      header: 'Estudiante',
      cell: (fb) => <span className="text-ink font-medium">{fb.userName}</span>,
    },
    {
      header: 'Cita',
      cell: (fb) => (
        <div>
          <span className="text-ink">{fb.venueName}</span>
          <p className="text-ink-2 mt-0.5 text-xs">
            {formatDateTime(fb.scheduledAt)}
          </p>
        </div>
      ),
    },
    {
      header: '¿Ocurrió?',
      cell: (fb) =>
        fb.occurred ? (
          <Badge label="Sí" tone="live" />
        ) : (
          <Badge label="No asistió" tone="error" />
        ),
    },
    {
      header: 'Rating',
      cell: (fb) =>
        fb.rating != null ? (
          <Stars rating={fb.rating} />
        ) : (
          <span className="text-ink-3">—</span>
        ),
    },
    {
      header: 'Gasto',
      className: 'text-right',
      cell: (fb) => (
        <span className="text-ink tabular-nums">
          {fb.amountSpent != null ? formatCOP(fb.amountSpent) : '—'}
        </span>
      ),
    },
    {
      header: 'Comentario',
      cell: (fb) => (
        <span className="text-ink-2 block max-w-xs truncate text-xs">
          {fb.comments ?? fb.noShowReason ?? '—'}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Feedback"
        description="Respuestas después de la cita: asistencia, calificación y gasto real (HU-10)."
      />
      <DataTable
        columns={columns}
        rows={data}
        rowKey={(fb) => fb.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="Todavía no hay feedback de citas."
      />
    </>
  );
}
