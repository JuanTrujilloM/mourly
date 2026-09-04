export interface AdminPreferences {
  relationshipType: string;
  orientation: string;
  minAge: number;
  maxAge: number;
  genderInterest: string;
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
