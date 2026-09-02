import { useQuery } from '@tanstack/react-query';
import { fetchCurrentMatch } from '@/lib/api/matches';

export function useCurrentMatch(enabled = true) {
  return useQuery({
    queryKey: ['currentMatch'],
    queryFn: fetchCurrentMatch,
    enabled,
    retry: false,
  });
}
