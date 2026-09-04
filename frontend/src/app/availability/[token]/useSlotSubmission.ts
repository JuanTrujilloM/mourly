'use client';

import { useState } from 'react';
import { useSubmitAvailability } from '@/hooks/useAvailabilityFlow';
import { getApiErrorMessage } from '@/lib/utils/errors';

export function useSlotSubmission(token: string) {
  const submit = useSubmitAvailability(token);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const toggle = (date: string, timeSlot: string) => {
    const key = `${date}|${timeSlot}`;
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setFormError(null);
  };

  const onSubmit = async () => {
    if (selected.size === 0) {
      setFormError('Marcá al menos un horario disponible.');
      return;
    }

    const slots = [...selected].map((key) => {
      const [date, timeSlot] = key.split('|');
      return { date, timeSlot };
    });

    try {
      await submit.mutateAsync(slots);
      setDone(true);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return {
    selected,
    formError,
    done,
    toggle,
    onSubmit,
    isPending: submit.isPending,
  };
}
