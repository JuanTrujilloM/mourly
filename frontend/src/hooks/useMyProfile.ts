import { useQuery } from '@tanstack/react-query';
import { fetchMyProfile } from '@/lib/api/profile';

export function useMyProfile(enabled = true) {
  return useQuery({
    queryKey: ['myProfile'],
    queryFn: fetchMyProfile,
    enabled,
    retry: false,
  });
}
