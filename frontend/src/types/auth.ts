export interface AuthUser {
  id: string;
  email: string;
  cellphone: string | null;
  cellphoneVerified: boolean;
  isVerified: boolean;
  university: string;
  onboardingCompleted: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VerifyPayload {
  email: string;
  code: string;
}
