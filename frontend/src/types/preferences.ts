export interface PreferencesResponse {
  id: string;
  relationshipType: string;
  minAge: number;
  maxAge: number;
  genderInterests: string[];
  sameUniversity: boolean;
  heightRange: string;
  energyVibe: string;
  hobbies: string[];
}
