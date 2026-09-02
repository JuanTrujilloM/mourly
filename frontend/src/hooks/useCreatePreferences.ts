import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPreferences } from '@/lib/api/preferences';

export function useCreatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}
