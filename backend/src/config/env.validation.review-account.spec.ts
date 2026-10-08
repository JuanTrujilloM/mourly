import { validateEnv } from './env.validation';

const BASE_CONFIG = {
  DATABASE_URL: 'postgresql://x',
  JWT_SECRET: 'a'.repeat(32),
  ADMIN_EMAILS: 'admin@eafit.edu.co, Ops@Mourly.com',
};

const withReview = (email: string, code: string) => ({
  ...BASE_CONFIG,
  REVIEW_ACCOUNT_EMAIL: email,
  REVIEW_ACCOUNT_CODE: code,
});

describe('validateEnv review account rules', () => {
  it('accepts a configuration without a review account', () => {
    expect(validateEnv(BASE_CONFIG)).toBe(BASE_CONFIG);
  });

  it('accepts a complete review account', () => {
    const config = withReview('revision@mourly.com', ' 482913 ');

    expect(validateEnv(config)).toBe(config);
  });

  it.each([
    ['revision@mourly.com', ''],
    ['', '482913'],
  ])('refuses half a review account (%p, %p)', (email, code) => {
    expect(() => validateEnv(withReview(email, code))).toThrow(
      /REVIEW_ACCOUNT_EMAIL and REVIEW_ACCOUNT_CODE must be set together/,
    );
  });

  it.each(['4829', '4829130', '48291a'])('refuses the code %p', (code) => {
    expect(() => validateEnv(withReview('revision@mourly.com', code))).toThrow(
      /REVIEW_ACCOUNT_CODE must be exactly six digits/,
    );
  });

  it('refuses an admin email regardless of case', () => {
    expect(() => validateEnv(withReview(' OPS@mourly.com', '482913'))).toThrow(
      /REVIEW_ACCOUNT_EMAIL must not be an admin email/,
    );
  });

  it('checks the review account outside production too', () => {
    expect(() =>
      validateEnv({
        ...withReview('revision@mourly.com', ''),
        NODE_ENV: 'test',
      }),
    ).toThrow(/must be set together/);
  });
});
