'use client';

import { Button } from '@/components/ui/Button';
import { useUpdateAvailability } from '@/hooks/useUpdateAvailability';
import { AVAILABILITY_STATUS } from '@/lib/constants/profile';

export function PausedCard() {
  const { mutate, isPending } = useUpdateAvailability();

  return (
    <section className="bg-surface border-line rounded-card mt-8 border p-6">
      <p className="label text-ink-3">Tu próxima cita</p>
      <p className="subheading text-ink mt-3 text-[22px]">Estás en pausa.</p>
      <p className="text-ink-2 mt-2 text-sm">
        No entrás en la ronda del jueves hasta que vuelvas a buscar.
      </p>
      <div className="mt-5">
        <Button
          onClick={() => mutate(AVAILABILITY_STATUS.SEARCHING)}
          disabled={isPending}
        >
          {isPending ? 'Un momento...' : 'Volver a buscar'}
        </Button>
      </div>
    </section>
  );
}
