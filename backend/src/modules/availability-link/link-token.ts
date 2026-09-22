import { createHash, randomBytes } from 'crypto';

// VENUE -> AVAILABILITY is the scheduling flow. DATE is the read-only link sent
// with the confirmation: it only opens the date page and never feeds the flow.
export type FlowStep = 'AVAILABILITY' | 'VENUE';
export type LinkStep = FlowStep | 'DATE';

export const FLOW_TOKEN_BYTES = 32;
// 128 bits: still brute-force-proof, and 22 characters instead of 43 so the
// confirmation SMS stays in one GSM-7 segment with the link in it.
export const DATE_TOKEN_BYTES = 16;

export function mintToken(bytes: number): string {
  return randomBytes(bytes).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
