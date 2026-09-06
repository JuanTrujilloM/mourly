import { apiClient } from './client';
import type { WaitlistPayload } from '@/types/waitlist';

export async function joinWaitlist(
  payload: WaitlistPayload,
): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    '/waitlist',
    payload,
  );
  return data;
}
