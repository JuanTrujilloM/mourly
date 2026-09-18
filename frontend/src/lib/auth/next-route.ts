import type { AuthUser } from '@/types/auth';

export const LOGIN_ROUTE = '/login';
export const CELLPHONE_ROUTE = '/onboarding/celular';

export function nextRouteFor(user: AuthUser): string {
  if (!user.cellphoneVerified) return CELLPHONE_ROUTE;
  return user.onboardingCompleted ? '/dashboard' : '/onboarding/perfil';
}
