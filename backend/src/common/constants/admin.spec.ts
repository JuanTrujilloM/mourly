import { isAdminEmail } from './admin';

describe('isAdminEmail', () => {
  const original = process.env.ADMIN_EMAILS;

  afterEach(() => {
    process.env.ADMIN_EMAILS = original;
  });

  it('is false when the allowlist is unset', () => {
    delete process.env.ADMIN_EMAILS;
    expect(isAdminEmail('someone@eafit.edu.co')).toBe(false);
  });

  it('matches an allowlisted email regardless of case and spacing', () => {
    process.env.ADMIN_EMAILS = ' Admin@eafit.edu.co , other@ces.edu.co ';
    expect(isAdminEmail('admin@EAFIT.edu.co')).toBe(true);
    expect(isAdminEmail('other@ces.edu.co')).toBe(true);
  });

  it('rejects an email outside the allowlist', () => {
    process.env.ADMIN_EMAILS = 'admin@eafit.edu.co';
    expect(isAdminEmail('intruder@eafit.edu.co')).toBe(false);
  });

  it('ignores empty entries in the list', () => {
    process.env.ADMIN_EMAILS = ',,admin@eafit.edu.co,,';
    expect(isAdminEmail('admin@eafit.edu.co')).toBe(true);
    expect(isAdminEmail('')).toBe(false);
  });
});
