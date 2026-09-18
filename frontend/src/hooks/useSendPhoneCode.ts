import { useMutation } from '@tanstack/react-query';
import { sendPhoneCode } from '@/lib/api/phone';

export function useSendPhoneCode() {
  return useMutation({ mutationFn: sendPhoneCode });
}
