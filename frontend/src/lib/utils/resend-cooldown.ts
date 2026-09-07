import { RESEND_COOLDOWN_SECONDS } from '@/lib/constants/auth';

const KEY_PREFIX = 'mourly.resend-until.';

function keyFor(email: string): string {
  return `${KEY_PREFIX}${email.trim().toLowerCase()}`;
}

// Remembers when the backend will accept the next code, so reloading the
// verification screen resumes the countdown instead of restarting it.
export function rememberResendCooldown(
  email: string,
  seconds = RESEND_COOLDOWN_SECONDS,
): void {
  try {
    sessionStorage.setItem(keyFor(email), String(Date.now() + seconds * 1000));
  } catch {
    // A blocked storage only costs accuracy: the countdown falls back to full.
  }
}

export function remainingResendCooldown(email: string): number {
  let until: string | null;
  try {
    until = sessionStorage.getItem(keyFor(email));
  } catch {
    // Without storage we cannot know, so assume a code was just sent.
    return RESEND_COOLDOWN_SECONDS;
  }

  const deadline = Number(until);
  if (!deadline) return 0;
  const seconds = Math.ceil((deadline - Date.now()) / 1000);
  return Math.min(Math.max(seconds, 0), RESEND_COOLDOWN_SECONDS);
}
