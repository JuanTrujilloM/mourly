import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCellphone } from '@/lib/api/phone';
import type { AuthUser } from '@/types/auth';

export function useUpdateCellphone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCellphone,
    onSuccess: ({ cellphone, cellphoneVerified }) => {
      queryClient.setQueryData<AuthUser>(['currentUser'], (user) =>
        user ? { ...user, cellphone, cellphoneVerified } : user,
      );
    },
  });
}
