// A single login for platform reviewers (e.g. Meta's dating-ads review), who
// cannot read an institutional inbox. The configured email is accepted
// without a university domain and gets a fixed code instead of a mailed one.
// Off unless both variables are set; the code must be six digits because that
// is all the verify form accepts.
const SIX_DIGITS = /^\d{6}$/;

function reviewAccount(): { email: string; code: string } | null {
  const email = (process.env.REVIEW_ACCOUNT_EMAIL ?? '').trim().toLowerCase();
  const code = (process.env.REVIEW_ACCOUNT_CODE ?? '').trim();
  if (!email || !SIX_DIGITS.test(code)) return null;
  return { email, code };
}

export function reviewAccountEmail(): string | null {
  return reviewAccount()?.email ?? null;
}

export function isReviewEmail(email: string): boolean {
  const account = reviewAccount();
  return account !== null && account.email === email.trim().toLowerCase();
}

export function reviewCodeFor(email: string): string | null {
  return isReviewEmail(email) ? (reviewAccount()?.code ?? null) : null;
}
