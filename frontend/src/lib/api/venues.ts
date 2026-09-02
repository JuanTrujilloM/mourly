import { apiClient } from './client';
import type { Venue, VenuePayload } from '@/types/venue';

export async function fetchVenues(): Promise<Venue[]> {
  const { data } = await apiClient.get<Venue[]>('/admin/venues');
  return data;
}

export async function createVenue(payload: VenuePayload): Promise<Venue> {
  const { data } = await apiClient.post<Venue>('/admin/venues', payload);
  return data;
}

export async function updateVenue(
  id: string,
  payload: Partial<VenuePayload>,
): Promise<Venue> {
  const { data } = await apiClient.patch<Venue>(`/admin/venues/${id}`, payload);
  return data;
}

export async function deactivateVenue(id: string): Promise<Venue> {
  const { data } = await apiClient.delete<Venue>(`/admin/venues/${id}`);
  return data;
}

