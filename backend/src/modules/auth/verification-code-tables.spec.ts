import { emailVerificationCodeTable } from './email-verification-code.table';
import { phoneVerificationCodeTable } from './phone-verification-code.table';
import type {
  VerificationCodeDb,
  VerificationCodeTable,
} from './verification-code-table';

const CASES: [string, VerificationCodeTable, string][] = [
  ['email', emailVerificationCodeTable, 'emailVerificationCode'],
  ['phone', phoneVerificationCodeTable, 'phoneVerificationCode'],
];

function setup(model: string) {
  const delegate = {
    findFirst: jest.fn().mockResolvedValue(null),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    create: jest.fn().mockResolvedValue({ id: 'code-1' }),
    update: jest.fn().mockResolvedValue({}),
  };
  return {
    db: { [model]: delegate } as unknown as VerificationCodeDb,
    delegate,
  };
}

describe.each(CASES)('%s verification code table', (_, table, model) => {
  it('reads the latest pending code of the user', async () => {
    const { db, delegate } = setup(model);

    await table.findLatestPending(db, 'u1');

    expect(delegate.findFirst).toHaveBeenCalledWith({
      where: { userId: 'u1', consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('stores a new code as given', async () => {
    const { db, delegate } = setup(model);
    const expiresAt = new Date();

    await table.create(db, {
      userId: 'u1',
      codeHash: 'hash',
      resendCount: 2,
      expiresAt,
    });

    expect(delegate.create).toHaveBeenCalledWith({
      data: { userId: 'u1', codeHash: 'hash', resendCount: 2, expiresAt },
    });
  });

  it('counts a failed attempt', async () => {
    const { db, delegate } = setup(model);

    await table.countAttempt(db, 'code-1');

    expect(delegate.update).toHaveBeenCalledWith({
      where: { id: 'code-1' },
      data: { attempts: { increment: 1 } },
    });
  });

  it('consumes a code', async () => {
    const { db, delegate } = setup(model);

    await table.consume(db, 'code-1');

    const call = delegate.update.mock.calls[0][0] as {
      where: { id: string };
      data: { consumedAt: Date };
    };
    expect(call.where).toEqual({ id: 'code-1' });
    expect(call.data.consumedAt).toBeInstanceOf(Date);
  });
});
