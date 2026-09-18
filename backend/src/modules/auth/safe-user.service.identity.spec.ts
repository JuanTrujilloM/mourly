import { UnauthorizedException } from '@nestjs/common';
import {
  SAFE_USER_ROW,
  setupSafeUser as setup,
} from './safe-user.test-helpers';

describe('SafeUserService identity fields', () => {
  const originalAdmins = process.env.ADMIN_EMAILS;

  afterEach(() => {
    process.env.ADMIN_EMAILS = originalAdmins;
  });

  it('derives isAdmin from the allowlist', async () => {
    process.env.ADMIN_EMAILS = 'ana@eafit.edu.co';
    const { service } = setup(SAFE_USER_ROW);

    expect((await service.getById('u1')).isAdmin).toBe(true);
  });

  it('reports a non-allowlisted user as not admin', async () => {
    process.env.ADMIN_EMAILS = 'someone.else@eafit.edu.co';
    const { service } = setup(SAFE_USER_ROW);

    expect((await service.getById('u1')).isAdmin).toBe(false);
  });

  it('derives the university from the verified email', async () => {
    const { service } = setup(SAFE_USER_ROW);

    expect((await service.getById('u1')).university).toBe('EAFIT');
  });

  it('rejects an unknown user id', async () => {
    const { service } = setup(null);

    await expect(service.getById('missing')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
