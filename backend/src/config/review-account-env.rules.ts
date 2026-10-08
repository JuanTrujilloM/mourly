import { parseAdminEmails } from '../common/constants/admin';
import { REVIEW_CODE_PATTERN } from '../common/constants/review-account';
import type { EnvReader } from './sms-env.rules';

const EMAIL_KEY = 'REVIEW_ACCOUNT_EMAIL';
const CODE_KEY = 'REVIEW_ACCOUNT_CODE';

const SET_TOGETHER_ERROR = `${EMAIL_KEY} and ${CODE_KEY} must be set together.`;
const CODE_SHAPE_ERROR = `${CODE_KEY} must be exactly six digits.`;
const ADMIN_EMAIL_ERROR = `${EMAIL_KEY} must not be an admin email.`;

export function reviewAccountErrors(read: EnvReader): string[] {
  const email = read(EMAIL_KEY).toLowerCase();
  const code = read(CODE_KEY);
  if (!email && !code) return [];
  if (!email || !code) return [SET_TOGETHER_ERROR];
  const isAdmin = parseAdminEmails(read('ADMIN_EMAILS')).has(email);
  return [
    ...(REVIEW_CODE_PATTERN.test(code) ? [] : [CODE_SHAPE_ERROR]),
    ...(isAdmin ? [ADMIN_EMAIL_ERROR] : []),
  ];
}
