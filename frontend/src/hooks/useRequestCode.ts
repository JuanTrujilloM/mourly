import { useMutation } from '@tanstack/react-query';
import { requestCode } from '@/lib/api/auth';

export function useRequestCode() {
  return useMutation({ mutationFn: requestCode });
}
