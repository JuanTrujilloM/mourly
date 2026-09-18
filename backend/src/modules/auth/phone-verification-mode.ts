export const PHONE_SMS_VERIFICATION_KEY = 'PHONE_SMS_VERIFICATION_ENABLED';

export function smsVerificationEnabled(value: string | undefined): boolean {
  return value?.trim() !== 'false';
}
