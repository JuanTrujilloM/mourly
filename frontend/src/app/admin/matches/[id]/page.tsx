'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MatchStatusBadge } from '@/components/admin/StatusBadge';
import { MatchComparison } from '@/components/admin/MatchComparison';
import { ErrorNote } from '@/components/admin/match-comparison/primitives';
import { Button } from '@/components/ui/Button';
import { useAdminMatch } from '@/hooks/useAdminData';
import { useCancelMatch } from '@/hooks/useAdminActions';
import { formatDate } from '@/lib/utils/format';

const CANCELABLE = new Set(['pending', 'confirmed']);

export default function AdminMatchDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: match, isLoading, isError } = useAdminMatch(params.id);
  const cancel = useCancelMatch();

  return (
    <>
      <Link
        href="/admin/matches"
        className="text-ink-2 hover:text-ink mb-4 inline-block text-sm transition"
      >
        Volver a matches
      </Link>

      {isLoading ? (
        <p className="text-ink-3 text-sm">Cargando match...</p>
      ) : isError || !match ? (
        <ErrorNote>No se pudo cargar este match.</ErrorNote>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="heading text-ink text-[28px]">
                {match.userA.name}
                <span className="text-ink-3 mx-2 font-normal">y</span>
                {match.userB.name}
              </h1>
              <MatchStatusBadge status={match.status} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-ink-3 text-xs">
                Creado {formatDate(match.createdAt)}
              </span>
              {CANCELABLE.has(match.status) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => cancel.mutate(match.id)}
                  disabled={cancel.isPending}
                >
                  Cancelar match
                </Button>
              )}
            </div>
          </div>

          <MatchComparison match={match} />
        </>
      )}
    </>
  );
}
