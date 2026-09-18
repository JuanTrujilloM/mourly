import { describe, expect, it } from 'vitest';
import { AUTH_USER } from '@/test-utils';
import { nextRouteFor } from './next-route';

describe('nextRouteFor', () => {
  it('sends an unverified cellphone to the cellphone step first', () => {
    expect(
      nextRouteFor({ ...AUTH_USER, cellphoneVerified: false, onboardingCompleted: false }),
    ).toBe('/onboarding/celular');
  });

  it('sends a verified cellphone without a profile to the profile step', () => {
    expect(nextRouteFor({ ...AUTH_USER, onboardingCompleted: false })).toBe(
      '/onboarding/perfil',
    );
  });

  it('sends a complete account to the dashboard', () => {
    expect(nextRouteFor(AUTH_USER)).toBe('/dashboard');
  });
});
