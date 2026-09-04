'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable } from '@/components/admin/DataTable';
import { useAdminMatches } from '@/hooks/useAdminData';
import { useCancelMatch } from '@/hooks/useAdminActions';
import { matchColumns } from './matchColumns';

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'completed', label: 'Completados' },
  { value: 'canceled', label: 'Cancelados' },
] as const;

type Filter = (typeof FILTERS)[number]['value'];

export default function AdminMatchesPage() {
  const { data, isLoading, isError } = useAdminMatches();
  const cancel = useCancelMatch();
  const [filter, setFilter] = useState<Filter>('all');

  const rows =
    filter === 'all' ? data : data?.filter((match) => match.status === filter);

  return (
    <>
      <PageHeader
        title="Matches"
        description="Todas las parejas generadas, su compatibilidad y el estado de su cita."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            aria-pressed={filter === option.value}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition duration-(--dur-fast) ${
              filter === option.value
                ? 'bg-ink text-page'
                : 'bg-surface-2 text-ink-2 hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={matchColumns((id) => cancel.mutate(id), cancel.isPending)}
        rows={rows}
        rowKey={(match) => match.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No hay matches en este estado."
      />
    </>
  );
}
