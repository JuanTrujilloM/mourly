const MIN_JWT_SECRET_LENGTH = 32;

const PLACEHOLDER_SECRETS = new Set([
  'change-me',
  'changeme',
  'secret',
  'my-secret',
  'any-random-string-for-local-dev',
]);

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === 'string' ? value.trim() : '';
}

function jwtSecretErrors(secret: string): string[] {
  if (!secret) {
    return ['JWT_SECRET is required.'];
  }
  if (PLACEHOLDER_SECRETS.has(secret.toLowerCase())) {
    return ['JWT_SECRET must not be a placeholder value.'];
  }
  if (secret.length < MIN_JWT_SECRET_LENGTH) {
    return [
      `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long.`,
    ];
  }
  return [];
}

function databaseUrlErrors(url: string): string[] {
  return url ? [] : ['DATABASE_URL is required.'];
}

const REQUIRED_IN_PRODUCTION = ['RESEND_API_KEY', 'GCS_BUCKET'];

const REQUIRED_TWILIO_KEYS = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'];
const TWILIO_ORIGIN_KEYS = ['TWILIO_MESSAGING_SERVICE_SID', 'TWILIO_FROM'];

function missingKeys(
  source: Record<string, unknown>,
  keys: string[],
): string[] {
  return keys.filter((key) => !readString(source, key));
}

function missingTwilioOrigin(source: Record<string, unknown>): string[] {
  const hasOrigin = TWILIO_ORIGIN_KEYS.some((key) => readString(source, key));
  return hasOrigin ? [] : [TWILIO_ORIGIN_KEYS.join(' or ')];
}

function productionErrors(source: Record<string, unknown>): string[] {
  if (readString(source, 'NODE_ENV') !== 'production') {
    return [];
  }
  return [
    ...missingKeys(source, [
      ...REQUIRED_IN_PRODUCTION,
      ...REQUIRED_TWILIO_KEYS,
    ]),
    ...missingTwilioOrigin(source),
  ].map((key) => `${key} is required in production.`);
}

export function validateEnv(
  source: Record<string, unknown>,
): Record<string, unknown> {
  const errors = [
    ...databaseUrlErrors(readString(source, 'DATABASE_URL')),
    ...jwtSecretErrors(readString(source, 'JWT_SECRET')),
    ...productionErrors(source),
  ];

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n- ${errors.join('\n- ')}`,
    );
  }
  return source;
}
