import { useQuery } from '@tanstack/react-query';
import { fetchCatalog } from '@/lib/api/catalog';
import type { Catalog } from '@/types/catalog';

const EMPTY_CATALOG: Catalog = {
  universities: [],
  genders: [],
  semesters: [],
  relationshipTypes: [],
  genderInterests: [],
  heightRanges: [],
  venueTypes: [],
  bounds: {
    minAge: 18,
    ageMin: 18,
    ageMax: 40,
    maxPhotos: 5,
    maxBioLength: 150,
    minHobbies: 3,
    minVibes: 1,
  },
};

export function useCatalog(): Catalog {
  const { data } = useQuery({
    queryKey: ['catalog'],
    queryFn: fetchCatalog,
    staleTime: Infinity,
  });

  return data ?? EMPTY_CATALOG;
}
