import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAvailabilityView,
  fetchTokenVenues,
  selectTokenVenues,
  submitAvailability,
} from '@/lib/api/availability';
import type { SlotSelection } from '@/types/availability';

function useInvalidateTokenFlow(token: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['availability', token] }),
      queryClient.invalidateQueries({ queryKey: ['tokenVenues', token] }),
    ]);
}

export function useAvailabilityView(token: string) {
  return useQuery({
    queryKey: ['availability', token],
    queryFn: () => fetchAvailabilityView(token),
    retry: false,
  });
}

export function useSubmitAvailability(token: string) {
  const invalidate = useInvalidateTokenFlow(token);
  return useMutation({
    mutationFn: (slots: SlotSelection[]) => submitAvailability(token, slots),
    onSuccess: invalidate,
  });
}

export function useTokenVenues(token: string) {
  return useQuery({
    queryKey: ['tokenVenues', token],
    queryFn: () => fetchTokenVenues(token),
    retry: false,
  });
}

export function useSelectTokenVenues(token: string) {
  const invalidate = useInvalidateTokenFlow(token);
  return useMutation({
    mutationFn: (venueIds: string[]) => selectTokenVenues(token, venueIds),
    onSuccess: invalidate,
  });
}
