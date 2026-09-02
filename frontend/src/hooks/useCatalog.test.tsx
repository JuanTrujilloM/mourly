import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryClient } from '@/test-utils';
import * as catalogApi from '@/lib/api/catalog';
import { useCatalog } from './useCatalog';

vi.mock('@/lib/api/catalog');

const fetchCatalog = vi.mocked(catalogApi.fetchCatalog);

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={createQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

describe('useCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty vocabularies until the backend answers', () => {
    fetchCatalog.mockReturnValue(new Promise(() => undefined));

    const { result } = renderHook(() => useCatalog(), { wrapper });

    expect(result.current.genders).toEqual([]);
    expect(result.current.universities).toEqual([]);
  });

  it('falls back to the bounds the backend enforces while loading', () => {
    fetchCatalog.mockReturnValue(new Promise(() => undefined));

    const { result } = renderHook(() => useCatalog(), { wrapper });

    expect(result.current.bounds.maxPhotos).toBe(5);
    expect(result.current.bounds.minAge).toBe(18);
  });

  it('serves the vocabularies the backend returned', async () => {
    fetchCatalog.mockResolvedValue({
      universities: [
        { domain: 'eafit.edu.co', name: 'EAFIT', city: 'Medellín' },
      ],
      genders: ['Femenino'],
      semesters: ['6'],
      relationshipTypes: ['Seria'],
      orientations: ['Heterosexual'],
      genderInterests: ['Hombres'],
      heightRanges: ['Indiferente'],
      venueTypes: ['Café'],
      bounds: {
        minAge: 18,
        ageMin: 18,
        ageMax: 40,
        maxPhotos: 5,
        maxBioLength: 150,
        minHobbies: 3,
        minVibes: 1,
      },
    });

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await waitFor(() => expect(result.current.genders).toEqual(['Femenino']));
    expect(result.current.universities[0].name).toBe('EAFIT');
  });

  it('keeps serving the fallback when the request fails', async () => {
    fetchCatalog.mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await waitFor(() => expect(fetchCatalog).toHaveBeenCalled());
    expect(result.current.genders).toEqual([]);
    expect(result.current.bounds.maxPhotos).toBe(5);
  });
});
