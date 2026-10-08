import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma.service';
import type { VerificationCodeTable } from './verification-code-table';

export type VerificationResult =
  | 'ok'
  | 'not_found'
  | 'expired'
  | 'too_many_attempts'
  | 'mismatch';

export const MAX_ATTEMPTS = 5;

export class VerificationCodeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly table: VerificationCodeTable,
  ) {}

  async validate(userId: string, code: string): Promise<VerificationResult> {
    const record = await this.table.findLatestPending(this.prisma, userId);

    if (!record) return 'not_found';
    if (record.expiresAt.getTime() < Date.now()) return 'expired';
    if (!(await this.claimAttempt(record.id))) return 'too_many_attempts';

    const matches = await bcrypt.compare(code, record.codeHash);
    if (!matches) return 'mismatch';

    await this.table.consume(this.prisma, record.id);
    return 'ok';
  }

  private claimAttempt(id: string): Promise<boolean> {
    return this.table.claimAttempt(this.prisma, id, MAX_ATTEMPTS);
  }
}
