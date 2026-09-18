import type { VerificationCodeTable } from './verification-code-table';

export const phoneVerificationCodeTable: VerificationCodeTable = {
  findLatestPending: (db, userId) =>
    db.phoneVerificationCode.findFirst({
      where: { userId, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    }),
  deletePending: async (db, userId) => {
    await db.phoneVerificationCode.deleteMany({
      where: { userId, consumedAt: null },
    });
  },
  create: async (db, code) => {
    await db.phoneVerificationCode.create({ data: code });
  },
  countAttempt: async (db, id) => {
    await db.phoneVerificationCode.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  },
  consume: async (db, id) => {
    await db.phoneVerificationCode.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  },
};
