export const REVIEW_CODE_PATTERN = /^\d{6}$/;

function reviewAccount(): { email: string; code: string } | null {
  const email = (process.env.REVIEW_ACCOUNT_EMAIL ?? '').trim().toLowerCase();
  const code = (process.env.REVIEW_ACCOUNT_CODE ?? '').trim();
  if (!email || !REVIEW_CODE_PATTERN.test(code)) return null;
  return { email, code };
}

export function reviewAccountEmail(): string | null {
  return reviewAccount()?.email ?? null;
}

export function reviewCodeFor(email: string): string | null {
  const account = reviewAccount();
  return account?.email === email.trim().toLowerCase() ? account.code : null;
}

export function isReviewEmail(email: string): boolean {
  return reviewCodeFor(email) !== null;
}
