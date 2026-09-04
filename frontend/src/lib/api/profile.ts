import { apiClient } from './client';
import type { ProfileResponse } from '@/types/profile';
import type { AvailabilityStatus } from '@/lib/constants/profile';

export async function createProfile(formData: FormData): Promise<void> {
  await apiClient.post('/profile', formData);
}

export async function fetchMyProfile(): Promise<ProfileResponse | null> {
  const { data } = await apiClient.get<ProfileResponse | null>('/profile/me');
  return data;
}

export async function updateAvailability(
  status: AvailabilityStatus,
): Promise<ProfileResponse> {
  const { data } = await apiClient.patch<ProfileResponse>(
    '/profile/availability',
    { status },
  );
  return data;
}
