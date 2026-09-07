export interface AdminPreferences {
  relationshipType: string;
  minAge: number;
  maxAge: number;
  genderInterests: string[];
  sameUniversity: boolean;
  heightRange: string;
  energyVibe: string;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  isVerified: boolean;
  name: string;
  age: number | null;
  gender: string | null;
  height: number | null;
  biography: string | null;
  university: string | null;
  major: string | null;
  semester: string | null;
  status: string | null;
  primaryPhoto: string | null;
  photos: string[];
  hobbies: string[];
  preferences: AdminPreferences | null;
}
