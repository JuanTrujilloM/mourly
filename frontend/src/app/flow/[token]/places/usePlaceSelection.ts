'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelectTokenVenues } from '@/hooks/useAvailabilityFlow';
import { getApiErrorMessage } from '@/lib/utils/errors';
import type { VenueSuggestion } from '@/types/venue';

interface PlacesStep {
  minSelection: number;
  venues: VenueSuggestion[];
}

export function usePlaceSelection(token: string, data: PlacesStep) {
  const router = useRouter();
  const select = useSelectTokenVenues(token);
  const [chosen, setChosen] = useState<string[] | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const serverSelected = data.venues
    .filter((venue) => venue.selected)
    .map((venue) => venue.id);
  const selectedIds = chosen ?? serverSelected;

  const toggle = (id: string) => {
    const isSelected = selectedIds.includes(id);
    if (!isSelected && selectedIds.length >= data.minSelection) {
      setFormError(`Solo puedes elegir ${data.minSelection} lugares.`);
      return;
    }
    setChosen(
      isSelected
        ? selectedIds.filter((venueId) => venueId !== id)
        : [...selectedIds, id],
    );
    setFormError(null);
  };

  const onConfirm = async () => {
    if (selectedIds.length !== data.minSelection) {
      setFormError(`Selecciona ${data.minSelection} lugares.`);
      return;
    }
    try {
      await select.mutateAsync(selectedIds);
      router.replace(`/availability/${token}`);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return {
    selectedIds,
    formError,
    toggle,
    onConfirm,
    isPending: select.isPending,
  };
}
