'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PhoneShell } from '@/components/shared/PhoneShell';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/Button';
import { AvailabilityCalendar } from '@/components/availability/AvailabilityCalendar';
import {
  FlowLinkError,
  FlowLoading,
  FlowStepCompleted,
} from '@/components/availability/FlowGuards';
import { useAvailabilityView } from '@/hooks/useAvailabilityFlow';
import type { AvailabilityView } from '@/types/availability';
import { useSlotSubmission } from './useSlotSubmission';

export default function AvailabilityPage() {
  const { token } = useParams<{ token: string }>();
  return (
    <PhoneShell>
      <AvailabilityContent token={token} />
    </PhoneShell>
  );
}

function AvailabilityContent({ token }: { token: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useAvailabilityView(token);
  const submission = useSlotSubmission(token);

  useEffect(() => {
    if (data?.step === 'VENUE') router.replace(`/flow/${token}/places`);
  }, [data?.step, token, router]);

  if (isLoading) return <FlowLoading label="Cargando tu calendario..." />;
  if (isError) return <FlowLinkError />;
  if (submission.done || data?.step === 'COMPLETED') {
    return <FlowStepCompleted />;
  }
  if (!data || data.step === 'VENUE') return null;

  return <SlotPicker data={data} submission={submission} />;
}

function SlotPicker({
  data,
  submission,
}: {
  data: Extract<AvailabilityView, { step: 'AVAILABILITY' }>;
  submission: ReturnType<typeof useSlotSubmission>;
}) {
  const { selected, formError, toggle, onSubmit, isPending } = submission;

  return (
    <>
      <div className="mb-6 flex flex-col items-center gap-5 text-center">
        <Logo />
        <div>
          <h1 className="heading text-ink text-4xl">¿Cuándo podés?</h1>
          <p className="text-ink-2 mt-2 text-sm">
            {data.partnerName
              ? `Marcá tus horarios libres para tu cita con ${data.partnerName}.`
              : 'Marcá tus horarios libres para tu cita.'}{' '}
            Cada horario dura una hora, de 12:00 pm a 7:00 pm.
          </p>
        </div>
      </div>

      <AvailabilityCalendar
        days={data.days}
        timeSlots={data.timeSlots}
        selected={selected}
        onToggle={toggle}
      />

      {formError && <p className="text-error mt-4 text-sm">{formError}</p>}

      <div className="mt-6">
        <Button className="w-full" disabled={isPending} onClick={onSubmit}>
          {isPending
            ? 'Guardando...'
            : `Continuar (${selected.size} ${selected.size === 1 ? 'horario' : 'horarios'})`}
        </Button>
      </div>
    </>
  );
}
