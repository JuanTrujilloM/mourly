import { apiClient } from './client';
import type { Catalog } from '@/types/catalog';

export async function fetchCatalog(): Promise<Catalog> {
  const { data } = await apiClient.get<Catalog>('/catalog');
  return data;
}
