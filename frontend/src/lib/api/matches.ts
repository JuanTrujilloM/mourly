import { apiClient } from './client';
import type { CurrentMatch } from '@/types/match';

export async function fetchCurrentMatch(): Promise<CurrentMatch | null> {
  const { data } = await apiClient.get<CurrentMatch | null>('/matches/current');
  return data;
}
