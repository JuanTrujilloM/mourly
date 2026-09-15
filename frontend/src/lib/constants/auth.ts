export const RESEND_COOLDOWN_SECONDS = 60;

// Mirrors of MAX_RESENDS (verification-resend-policy.ts) and the default
// EMAIL_CODE_TTL_MINUTES in the backend; keep them in sync.
export const MAX_RESENDS = 3;
export const EMAIL_CODE_TTL_SECONDS = 10 * 60;

// Mirror of UNSUPPORTED_UNIVERSITY_MESSAGE in the backend universities module.
// Matching it is how registration knows to offer the waitlist instead of a
// plain error; keep both sides in sync.
export const UNSUPPORTED_UNIVERSITY_MESSAGE =
  'Todavía no llegamos a tu universidad.';
