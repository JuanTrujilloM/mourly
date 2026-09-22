import { apiClient } from './client';
import type { DateView } from '@/types/date-view';

export async function fetchDateView(token: string): Promise<DateView> {
  const { data } = await apiClient.get<DateView>(`/dates/${token}`);
  return data;
}
