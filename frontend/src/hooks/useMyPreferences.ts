import { useQuery } from '@tanstack/react-query';
import { fetchMyPreferences } from '@/lib/api/preferences';

export function useMyPreferences(enabled = true) {
  return useQuery({
    queryKey: ['myPreferences'],
    queryFn: fetchMyPreferences,
    enabled,
    retry: false,
  });
}
