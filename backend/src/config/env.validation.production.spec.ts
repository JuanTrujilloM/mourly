import { PRODUCTION_CONFIG } from './env.test-fixtures';
import { validateEnv } from './env.validation';

const PRODUCTION_BASE = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://x',
  JWT_SECRET: 'a'.repeat(32),
};

describe('validateEnv in production', () => {
  it('requires a Resend API key so codes are never logged', () => {
    expect(() => validateEnv(PRODUCTION_BASE)).toThrow(
      /RESEND_API_KEY is required in production/,
    );
  });

  it('requires a GCS bucket so photos survive a deploy', () => {
    expect(() =>
      validateEnv({ ...PRODUCTION_BASE, RESEND_API_KEY: 're_live' }),
    ).toThrow(/GCS_BUCKET is required in production/);
  });

  it('accepts a complete production configuration', () => {
    const config = { ...PRODUCTION_CONFIG };

    expect(validateEnv(config)).toBe(config);
  });
});
