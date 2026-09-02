import { apiClient } from './client';
import type {
  AvailabilityView,
  SlotSelection,
  TokenVenuesView,
} from '@/types/availability';


export async function fetchAvailabilityView(
  token: string,
): Promise<AvailabilityView> {
  const { data } = await apiClient.get<AvailabilityView>(
    `/availability/${token}`,
  );
  return data;
}

export async function submitAvailability(
  token: string,
  slots: SlotSelection[],
): Promise<{ step: 'COMPLETED' }> {
  const { data } = await apiClient.post<{ step: 'COMPLETED' }>(
    `/availability/${token}`,
    { slots },
  );
  return data;
}

export async function fetchTokenVenues(
  token: string,
): Promise<TokenVenuesView> {
  const { data } = await apiClient.get<TokenVenuesView>(
    `/availability/${token}/venues`,
  );
  return data;
}

export async function selectTokenVenues(
  token: string,
  venueIds: string[],
): Promise<{ step: 'AVAILABILITY' }> {
  const { data } = await apiClient.post<{ step: 'AVAILABILITY' }>(
    `/availability/${token}/venues`,
    { venueIds },
  );
  return data;
}
