import { useMutation, useQueryClient } from '@tanstack/react-query';
import { verifyPhoneCode } from '@/lib/api/phone';

export function useVerifyPhoneCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyPhoneCode,
    onSuccess: (user) => {
      queryClient.setQueryData(['currentUser'], user);
    },
  });
}
