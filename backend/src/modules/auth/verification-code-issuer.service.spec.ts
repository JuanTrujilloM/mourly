import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma.service';
import { VerificationCodeIssuerService } from './verification-code-issuer.service';

function setup(ttlMinutes = 10) {
  const tx = { $queryRaw: jest.fn().mockResolvedValue([{ id: 'u1' }]) };
  const table = {
    findLatestPending: jest.fn().mockResolvedValue(null),
    retirePending: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockResolvedValue(undefined),
    countAttempt: jest.fn(),
    consume: jest.fn(),
  };
  const $transaction = jest.fn((work: (client: typeof tx) => unknown) =>
    work(tx),
  );
  const prisma = { $transaction } as unknown as PrismaService;
  const service = new VerificationCodeIssuerService(prisma, table, ttlMinutes);
  return { service, tx, $transaction, table };
}

function pendingCode(overrides: Record<string, unknown> = {}) {
  return {
    resendCount: 0,
    createdAt: new Date(Date.now() - 120_000),
    expiresAt: new Date(Date.now() + 300_000),
    ...overrides,
  };
}

describe('VerificationCodeIssuerService', () => {
  it('returns a six digit code and stores only its hash', async () => {
    const { service, table } = setup();

    const code = await service.issueIfAllowed('u1');

    expect(code).toMatch(/^\d{6}$/);
    const stored = table.create.mock.calls[0][1].codeHash as string;
    expect(stored).not.toBe(code);
    expect(bcrypt.compareSync(code as string, stored)).toBe(true);
  });

  it('locks the user row before reading, then replaces the pending code', async () => {
    const { service, tx, table, $transaction } = setup();

    await service.issueIfAllowed('u1');

    expect($transaction).toHaveBeenCalledTimes(1);
    const [lock] = tx.$queryRaw.mock.invocationCallOrder;
    const [read] = table.findLatestPending.mock.invocationCallOrder;
    const [drop] = table.retirePending.mock.invocationCallOrder;
    const [insert] = table.create.mock.invocationCallOrder;
    expect(lock).toBeLessThan(read);
    expect(read).toBeLessThan(drop);
    expect(drop).toBeLessThan(insert);
    expect(table.retirePending).toHaveBeenCalledWith(tx, 'u1');
  });

  it('stamps the next resend count from the pending code', async () => {
    const { service, table } = setup();
    table.findLatestPending.mockResolvedValue(pendingCode({ resendCount: 1 }));

    await service.issueIfAllowed('u1');

    expect(table.create.mock.calls[0][1].resendCount).toBe(2);
  });

  it('writes nothing and returns null when the policy refuses', async () => {
    const { service, table } = setup();
    table.findLatestPending.mockResolvedValue(
      pendingCode({ createdAt: new Date() }),
    );

    expect(await service.issueIfAllowed('u1')).toBeNull();
    expect(table.retirePending).not.toHaveBeenCalled();
    expect(table.create).not.toHaveBeenCalled();
  });

  it('expires the code after the configured time to live', async () => {
    const { service, table } = setup(30);
    const before = Date.now();

    await service.issueIfAllowed('u1');

    const expiresAt = table.create.mock.calls[0][1].expiresAt as Date;
    expect(expiresAt.getTime()).toBeGreaterThan(before + 29 * 60_000);
    expect(service.ttlMinutes).toBe(30);
  });
});
