import { Injectable } from '@nestjs/common';

const ABUSIVE_PATTERNS: RegExp[] = [
  /\bputa\b/i,
  /\bmaric[oó]n\b/i,
  /\bgonorrea\b/i,
  /\bhijueputa\b/i,
  /\bfuck\b/i,
  /\bbitch\b/i,
];

@Injectable()
export class ModerationService {
  screen(text: string): { blocked: boolean } {
    return { blocked: ABUSIVE_PATTERNS.some((pattern) => pattern.test(text)) };
  }
}
