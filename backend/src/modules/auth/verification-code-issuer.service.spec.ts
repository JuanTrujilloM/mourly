import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma.service';
import { VerificationCodeIssuerService } from './verification-code-issuer.service';

function setup(env: Record<string, string> = {}) {
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue([{ id: 'u1' }]),
    emailVerificationCode: {
      findFirst: jest.fn().mockResolvedValue(null),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({ id: 'code-1' }),
    },
  };
  const $transaction = jest.fn((work: (client: typeof tx) => unknown) =>
    work(tx),
  );
  const prisma = { $transaction } as unknown as PrismaService;
  const config = { get: (key: string) => env[key] } as unknown as ConfigService;
  const service = new VerificationCodeIssuerService(prisma, config);
  return { service, tx, $transaction, codes: tx.emailVerificationCode };
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
    const { service, codes } = setup();

    const code = await service.issueIfAllowed('u1');

    expect(code).toMatch(/^\d{6}$/);
    const stored = codes.create.mock.calls[0][0].data.codeHash as string;
    expect(stored).not.toBe(code);
    expect(bcrypt.compareSync(code as string, stored)).toBe(true);
  });

  it('locks the user row before reading, then replaces the pending code', async () => {
    const { service, tx, codes, $transaction } = setup();

    await service.issueIfAllowed('u1');

    expect($transaction).toHaveBeenCalledTimes(1);
    const [lock] = tx.$queryRaw.mock.invocationCallOrder;
    const [read] = codes.findFirst.mock.invocationCallOrder;
    const [drop] = codes.deleteMany.mock.invocationCallOrder;
    const [insert] = codes.create.mock.invocationCallOrder;
    expect(lock).toBeLessThan(read);
    expect(read).toBeLessThan(drop);
    expect(drop).toBeLessThan(insert);
    expect(codes.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'u1', consumedAt: null },
    });
  });

  it('stamps the next resend count from the pending code', async () => {
    const { service, codes } = setup();
    codes.findFirst.mockResolvedValue(pendingCode({ resendCount: 1 }));

    await service.issueIfAllowed('u1');

    expect(codes.create.mock.calls[0][0].data.resendCount).toBe(2);
  });

  it('writes nothing and returns null when the policy refuses', async () => {
    const { service, codes } = setup();
    codes.findFirst.mockResolvedValue(pendingCode({ createdAt: new Date() }));

    expect(await service.issueIfAllowed('u1')).toBeNull();
    expect(codes.deleteMany).not.toHaveBeenCalled();
    expect(codes.create).not.toHaveBeenCalled();
  });

  it('honors a configured time to live', async () => {
    const { service, codes } = setup({ EMAIL_CODE_TTL_MINUTES: '30' });
    const before = Date.now();

    await service.issueIfAllowed('u1');

    const expiresAt = codes.create.mock.calls[0][0].data.expiresAt as Date;
    expect(expiresAt.getTime()).toBeGreaterThan(before + 29 * 60_000);
  });
});
