import { useQuery } from '@tanstack/react-query';
import { fetchVenues } from '@/lib/api/venues';

export function useVenues(enabled = true) {
  return useQuery({
    queryKey: ['adminVenues'],
    queryFn: fetchVenues,
    enabled,
    retry: false,
  });
}
