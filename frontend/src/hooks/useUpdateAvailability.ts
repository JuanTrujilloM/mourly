import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAvailability } from '@/lib/api/profile';
import type { AvailabilityStatus } from '@/lib/constants/profile';
import type { ProfileResponse } from '@/types/profile';

export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: AvailabilityStatus) => updateAvailability(status),
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: ['myProfile'] });
      const previous = queryClient.getQueryData<ProfileResponse | null>([
        'myProfile',
      ]);
      if (previous) {
        queryClient.setQueryData<ProfileResponse>(['myProfile'], {
          ...previous,
          status,
        });
      }
      return { previous };
    },
    onError: (_error, _status, context) => {
      queryClient.setQueryData(['myProfile'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
}
