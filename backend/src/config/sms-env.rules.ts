import {
  PHONE_SMS_VERIFICATION_KEY,
  smsVerificationEnabled,
} from '../modules/auth/phone-verification-mode';

export type EnvReader = (key: string) => string;

const REQUIRED_TWILIO_KEYS = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'];
const TWILIO_ORIGIN_KEYS = ['TWILIO_MESSAGING_SERVICE_SID', 'TWILIO_FROM'];
const EMAIL_NOTIFICATIONS_KEY = 'EMAIL_NOTIFICATIONS_ENABLED';
const EMAIL_FALLBACK_ERROR = `${EMAIL_NOTIFICATIONS_KEY} must be true in production while Twilio is not configured.`;

function missingTwilioKeys(read: EnvReader): string[] {
  const missing = REQUIRED_TWILIO_KEYS.filter((key) => !read(key));
  const hasOrigin = TWILIO_ORIGIN_KEYS.some((key) => read(key));
  return hasOrigin ? missing : [...missing, TWILIO_ORIGIN_KEYS.join(' or ')];
}

export function smsProductionErrors(read: EnvReader): string[] {
  const missing = missingTwilioKeys(read);
  if (smsVerificationEnabled(read(PHONE_SMS_VERIFICATION_KEY))) {
    return missing.map((key) => `${key} is required in production.`);
  }
  const emailCoversNotifications = read(EMAIL_NOTIFICATIONS_KEY) === 'true';
  return missing.length > 0 && !emailCoversNotifications
    ? [EMAIL_FALLBACK_ERROR]
    : [];
}
