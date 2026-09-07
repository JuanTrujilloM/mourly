import { useMutation } from '@tanstack/react-query';
import { joinWaitlist } from '@/lib/api/waitlist';

export function useJoinWaitlist() {
  return useMutation({ mutationFn: joinWaitlist });
}
