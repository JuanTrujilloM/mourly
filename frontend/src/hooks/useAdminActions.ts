import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setUserStatus, verifyUser, cancelMatch } from '@/lib/api/admin';


export function useSetUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      setUserStatus(id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
  });
}

export function useVerifyUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => verifyUser(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
  });
}

export function useCancelMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelMatch(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['adminMatches'] }),
  });
}
