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

export function validateEnv(
  source: Record<string, unknown>,
): Record<string, unknown> {
  const errors = [
    ...databaseUrlErrors(readString(source, 'DATABASE_URL')),
    ...jwtSecretErrors(readString(source, 'JWT_SECRET')),
  ];

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n- ${errors.join('\n- ')}`,
    );
  }
  return source;
}
