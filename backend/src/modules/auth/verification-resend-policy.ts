const RESEND_COOLDOWN_MS = 60_000;
const MAX_RESENDS = 3;

export interface PendingVerificationCode {
  resendCount: number;
  createdAt: Date;
  expiresAt: Date;
}

export type ResendDecision =
  | { allowed: false }
  | { allowed: true; resendCount: number };

export function decideResend(
  latest: PendingVerificationCode | null,
  now: number,
): ResendDecision {
  if (!latest || latest.expiresAt.getTime() <= now) {
    return { allowed: true, resendCount: 0 };
  }
  const coolingDown = now - latest.createdAt.getTime() < RESEND_COOLDOWN_MS;
  if (coolingDown || latest.resendCount >= MAX_RESENDS) {
    return { allowed: false };
  }
  return { allowed: true, resendCount: latest.resendCount + 1 };
}
