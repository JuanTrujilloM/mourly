'use client';

import { useUpdateAvailability } from '@/hooks/useUpdateAvailability';
import {
  AVAILABILITY_STATUS,
  AVAILABILITY_LABELS,
  type AvailabilityStatus,
} from '@/lib/constants/profile';

export function AvailabilityToggle({ status }: { status: AvailabilityStatus }) {
  const { mutate, isPending } = useUpdateAvailability();
  const searching = status === AVAILABILITY_STATUS.SEARCHING;

  const next = searching
    ? AVAILABILITY_STATUS.PAUSED
    : AVAILABILITY_STATUS.SEARCHING;

  return (
    <div className="flex flex-col items-center text-center">
      <button
        type="button"
        disabled={isPending}
        onClick={() => mutate(next)}
        className={`rounded-full px-6 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
          searching
            ? 'bg-cyan text-navy-deep hover:brightness-110'
            : 'bg-blush text-navy-deep hover:brightness-110'
        }`}
      >
        {searching ? '🔍 ' : '⏸ '}
        {AVAILABILITY_LABELS[status]}
      </button>
      <p className="text-slate mt-3 text-sm">
        {searching
          ? 'Cada domingo a las 7pm la IA buscará tu match de la semana.'
          : 'En pausa: no recibirás match hasta que reanudes la búsqueda.'}
      </p>
    </div>
  );
}
