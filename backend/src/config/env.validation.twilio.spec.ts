import { PRODUCTION_CONFIG } from './env.test-fixtures';
import { validateEnv } from './env.validation';

function withoutKey(key: keyof typeof PRODUCTION_CONFIG) {
  const config: Record<string, unknown> = { ...PRODUCTION_CONFIG };
  delete config[key];
  return config;
}

describe('validateEnv in production: Twilio', () => {
  it.each(['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'] as const)(
    'requires %s so SMS are never only logged',
    (key) => {
      expect(() => validateEnv(withoutKey(key))).toThrow(
        `${key} is required in production.`,
      );
    },
  );

  it('requires a messaging service or a sender number', () => {
    expect(() =>
      validateEnv(withoutKey('TWILIO_MESSAGING_SERVICE_SID')),
    ).toThrow(
      'TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM is required in production.',
    );
  });

  it('accepts a sender number in place of a messaging service', () => {
    const config = {
      ...withoutKey('TWILIO_MESSAGING_SERVICE_SID'),
      TWILIO_FROM: '+15005550006',
    };

    expect(validateEnv(config)).toBe(config);
  });

  it('does not require Twilio outside production', () => {
    const config = { ...withoutKey('TWILIO_ACCOUNT_SID'), NODE_ENV: 'test' };

    expect(validateEnv(config)).toBe(config);
  });
});
