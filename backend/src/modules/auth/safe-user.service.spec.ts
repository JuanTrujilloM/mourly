import {
  SAFE_USER_ROW,
  setupSafeUser as setup,
} from './safe-user.test-helpers';

describe('SafeUserService', () => {
  it('never exposes fields beyond the safe shape', async () => {
    const { service } = setup(SAFE_USER_ROW);

    const safe = await service.getById('u1');

    expect(Object.keys(safe).sort()).toEqual([
      'cellphone',
      'cellphoneVerified',
      'createdAt',
      'email',
      'id',
      'isAdmin',
      'isVerified',
      'onboardingCompleted',
      'university',
      'updatedAt',
    ]);
  });

  it('reports the cellphone as verified once it carries a timestamp', async () => {
    const unverified = setup(SAFE_USER_ROW);
    const verified = setup({
      ...SAFE_USER_ROW,
      cellphoneVerifiedAt: new Date(),
    });

    expect((await unverified.service.getById('u1')).cellphoneVerified).toBe(
      false,
    );
    expect((await verified.service.getById('u1')).cellphoneVerified).toBe(true);
  });

  it('marks onboarding complete only with both profile and preferences', async () => {
    const { service } = setup(SAFE_USER_ROW);

    expect((await service.getById('u1')).onboardingCompleted).toBe(true);
  });

  it('marks onboarding incomplete when preferences are missing', async () => {
    const { service } = setup({ ...SAFE_USER_ROW, preferences: null });

    expect((await service.getById('u1')).onboardingCompleted).toBe(false);
  });

  it('marks onboarding incomplete when the profile is missing', async () => {
    const { service } = setup({ ...SAFE_USER_ROW, profile: null });

    expect((await service.getById('u1')).onboardingCompleted).toBe(false);
  });
});
