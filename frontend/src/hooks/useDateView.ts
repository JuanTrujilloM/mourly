import { useQuery } from '@tanstack/react-query';
import { fetchDateView } from '@/lib/api/dates';

export function useDateView(token: string) {
  return useQuery({
    queryKey: ['dateView', token],
    queryFn: () => fetchDateView(token),
    retry: false,
  });
}
