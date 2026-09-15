import { validateEnv } from './env.validation';

const LONG_SECRET = 'a'.repeat(32);

describe('validateEnv', () => {
  it('accepts a complete configuration', () => {
    const config = {
      DATABASE_URL: 'postgresql://localhost:5432/db',
      JWT_SECRET: LONG_SECRET,
    };

    expect(validateEnv(config)).toBe(config);
  });

  it('requires a database url', () => {
    expect(() => validateEnv({ JWT_SECRET: LONG_SECRET })).toThrow(
      /DATABASE_URL is required/,
    );
  });

  it('requires a jwt secret', () => {
    expect(() => validateEnv({ DATABASE_URL: 'postgresql://x' })).toThrow(
      /JWT_SECRET is required/,
    );
  });

  it('rejects a short jwt secret', () => {
    expect(() =>
      validateEnv({ DATABASE_URL: 'postgresql://x', JWT_SECRET: 'short' }),
    ).toThrow(/at least 32 characters/);
  });

  it('names the placeholder before complaining about length', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: 'postgresql://x',
        JWT_SECRET: 'change-me',
      }),
    ).toThrow(/placeholder/);
  });

  it('rejects the documented dev placeholder regardless of case', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: 'postgresql://x',
        JWT_SECRET: 'ANY-RANDOM-STRING-FOR-LOCAL-DEV',
      }),
    ).toThrow(/placeholder/);
  });

  it('accepts a secret that merely starts like a placeholder', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: 'postgresql://x',
        JWT_SECRET: 'change-me'.padEnd(32, 'x'),
      }),
    ).not.toThrow();
  });

  it('reports every problem at once', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL[\s\S]*JWT_SECRET/);
  });

  describe('in production', () => {
    const PRODUCTION_BASE = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://x',
      JWT_SECRET: LONG_SECRET,
    };

    it('requires a Resend API key so codes are never logged', () => {
      expect(() => validateEnv(PRODUCTION_BASE)).toThrow(
        /RESEND_API_KEY is required in production/,
      );
    });

    it('accepts a production configuration with a Resend API key', () => {
      const config = { ...PRODUCTION_BASE, RESEND_API_KEY: 're_live' };

      expect(validateEnv(config)).toBe(config);
    });
  });

  it('does not require a Resend API key outside production', () => {
    expect(() =>
      validateEnv({ DATABASE_URL: 'postgresql://x', JWT_SECRET: LONG_SECRET }),
    ).not.toThrow();
  });

  it('ignores non string values', () => {
    expect(() => validateEnv({ DATABASE_URL: 42, JWT_SECRET: null })).toThrow(
      /DATABASE_URL is required/,
    );
  });
});
