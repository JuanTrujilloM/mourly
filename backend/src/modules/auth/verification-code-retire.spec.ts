import { emailVerificationCodeTable } from './email-verification-code.table';
import { phoneVerificationCodeTable } from './phone-verification-code.table';
import type { VerificationCodeDb } from './verification-code-table';

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

describe('retiring pending codes', () => {
  it('drops the pending email codes of the user', async () => {
    const { db, delegate } = setup('emailVerificationCode');

    await emailVerificationCodeTable.retirePending(db, 'u1');

    expect(delegate.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'u1', consumedAt: null },
    });
  });

  it('closes the pending phone codes but keeps them for the daily quota', async () => {
    const { db, delegate } = setup('phoneVerificationCode');

    await phoneVerificationCodeTable.retirePending(db, 'u1');

    const call = delegate.updateMany.mock.calls[0][0] as {
      where: unknown;
      data: { consumedAt: Date };
    };
    expect(call.where).toEqual({ userId: 'u1', consumedAt: null });
    expect(call.data.consumedAt).toBeInstanceOf(Date);
    expect(delegate.deleteMany).not.toHaveBeenCalled();
  });
});
