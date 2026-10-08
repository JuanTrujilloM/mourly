import { PrismaService } from '../../config/prisma.service';
import { VerificationCodeIssuerService } from './verification-code-issuer.service';

export function setupIssuer(ttlMinutes = 10) {
  const tx = { $queryRaw: jest.fn().mockResolvedValue([{ id: 'u1' }]) };
  const table = {
    findLatestPending: jest.fn().mockResolvedValue(null),
    retirePending: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockResolvedValue(undefined),
    claimAttempt: jest.fn(),
    consume: jest.fn(),
  };
  const $transaction = jest.fn((work: (client: typeof tx) => unknown) =>
    work(tx),
  );
  const prisma = { $transaction } as unknown as PrismaService;
  const service = new VerificationCodeIssuerService(prisma, table, ttlMinutes);
  return { service, tx, $transaction, table };
}

export function pendingCode(overrides: Record<string, unknown> = {}) {
  return {
    attempts: 0,
    resendCount: 0,
    createdAt: new Date(Date.now() - 120_000),
    expiresAt: new Date(Date.now() + 300_000),
    ...overrides,
  };
}
