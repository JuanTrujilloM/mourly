import {
  EMAIL_CODE_TTL_SECONDS,
  MAX_RESENDS,
} from '@/lib/constants/auth';

const KEY_PREFIX = 'mourly.resends.';

interface ResendHistory {
  count: number;
  lastSentAt: number;
}

function keyFor(email: string): string {
  return `${KEY_PREFIX}${email.trim().toLowerCase()}`;
}

// The API answers resend with 200 whether or not it sent a code, so it cannot
// tell the visitor the allowance is spent. The count lives here instead, and
// resets when the last code would have expired, as the backend cycle does.
const EMPTY_HISTORY: ResendHistory = { count: 0, lastSentAt: 0 };

function readHistory(email: string): ResendHistory {
  let stored: ResendHistory | null;
  try {
    stored = JSON.parse(sessionStorage.getItem(keyFor(email)) ?? 'null');
  } catch {
    return EMPTY_HISTORY;
  }
  if (!stored) return EMPTY_HISTORY;
  const age = Date.now() - stored.lastSentAt;
  return age >= EMAIL_CODE_TTL_SECONDS * 1000 ? EMPTY_HISTORY : stored;
}

export function recordResend(email: string): void {
  const next = { count: readHistory(email).count + 1, lastSentAt: Date.now() };
  try {
    sessionStorage.setItem(keyFor(email), JSON.stringify(next));
  } catch {
    // Without storage the limit is simply never shown; the API still enforces it.
  }
}

export function hasSpentResends(email: string): boolean {
  return readHistory(email).count >= MAX_RESENDS;
}
