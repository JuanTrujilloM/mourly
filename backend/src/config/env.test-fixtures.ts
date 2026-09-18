export const TWILIO_CONFIG = {
  TWILIO_ACCOUNT_SID: 'ACtest',
  TWILIO_AUTH_TOKEN: 'token',
  TWILIO_MESSAGING_SERVICE_SID: 'MGtest',
};

export const PRODUCTION_CONFIG = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://x',
  JWT_SECRET: 'a'.repeat(32),
  RESEND_API_KEY: 're_live',
  GCS_BUCKET: 'mourly-media',
  ...TWILIO_CONFIG,
};
