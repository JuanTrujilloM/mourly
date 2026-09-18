import type { Prisma } from '../../generated/prisma/client';

export type VerificationCodeDb = Prisma.TransactionClient;

export interface PendingVerificationCodeRecord {
  id: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  resendCount: number;
  createdAt: Date;
}

export interface NewVerificationCode {
  userId: string;
  codeHash: string;
  resendCount: number;
  expiresAt: Date;
}

export interface VerificationCodeTable {
  findLatestPending(
    db: VerificationCodeDb,
    userId: string,
  ): Promise<PendingVerificationCodeRecord | null>;
  retirePending(db: VerificationCodeDb, userId: string): Promise<void>;
  create(db: VerificationCodeDb, code: NewVerificationCode): Promise<void>;
  countAttempt(db: VerificationCodeDb, id: string): Promise<void>;
  consume(db: VerificationCodeDb, id: string): Promise<void>;
}
