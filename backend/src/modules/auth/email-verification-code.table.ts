import type { VerificationCodeTable } from './verification-code-table';

export const emailVerificationCodeTable: VerificationCodeTable = {
  findLatestPending: (db, userId) =>
    db.emailVerificationCode.findFirst({
      where: { userId, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    }),
  retirePending: async (db, userId) => {
    await db.emailVerificationCode.deleteMany({
      where: { userId, consumedAt: null },
    });
  },
  create: async (db, code) => {
    await db.emailVerificationCode.create({ data: code });
  },
  claimAttempt: async (db, id, limit) => {
    const { count } = await db.emailVerificationCode.updateMany({
      where: { id, attempts: { lt: limit } },
      data: { attempts: { increment: 1 } },
    });
    return count === 1;
  },
  consume: async (db, id) => {
    await db.emailVerificationCode.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  },
};
