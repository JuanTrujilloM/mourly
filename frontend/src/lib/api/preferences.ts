import { apiClient } from './client';
import type { PreferencesValues } from '@/lib/validation/preferences';
import type { PreferencesResponse } from '@/types/preferences';

export async function createPreferences(
  values: PreferencesValues,
): Promise<void> {
  await apiClient.post('/preferences', values);
}

export async function fetchMyPreferences(): Promise<PreferencesResponse | null> {
  const { data } = await apiClient.get<PreferencesResponse | null>(
    '/preferences/me',
  );
  return data;
}
