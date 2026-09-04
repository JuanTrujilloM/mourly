export interface AdminUserProfile {
  name: string;
  age: number;
  gender: string;
  university: string;
  major: string;
  semester: string;
  status: string;
}

export interface AdminUser {
  id: string;
  email: string;
  cellphone: string;
  isVerified: boolean;
  createdAt: string;
  matchCount: number;
  profile: AdminUserProfile | null;
}
