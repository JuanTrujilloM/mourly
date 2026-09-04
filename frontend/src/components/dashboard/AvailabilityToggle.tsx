'use client';

import { Button } from '@/components/ui/Button';
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
      <Button
        variant={searching ? 'primary' : 'secondary'}
        size="sm"
        disabled={isPending}
        onClick={() => mutate(next)}
      >
        {AVAILABILITY_LABELS[status]}
      </Button>
      <p className="text-ink-2 mt-3 text-sm">
        {searching
          ? 'Cada jueves a las 7:00 pm buscamos tu cita de la semana.'
          : 'En pausa: no vas a recibir cita hasta que vuelvas a buscar.'}
      </p>
    </div>
  );
}
