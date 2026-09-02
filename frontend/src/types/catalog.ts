export interface CatalogUniversity {
  domain: string;
  name: string;
  city: string;
}

export interface CatalogBounds {
  minAge: number;
  ageMin: number;
  ageMax: number;
  maxPhotos: number;
  maxBioLength: number;
  minHobbies: number;
  minVibes: number;
}

export interface Catalog {
  universities: CatalogUniversity[];
  genders: string[];
  semesters: string[];
  relationshipTypes: string[];
  orientations: string[];
  genderInterests: string[];
  heightRanges: string[];
  venueTypes: string[];
  bounds: CatalogBounds;
}
