import type { VerificationCodeTable } from './verification-code-table';

export const phoneVerificationCodeTable: VerificationCodeTable = {
  findLatestPending: (db, userId) =>
    db.phoneVerificationCode.findFirst({
      where: { userId, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    }),
  retirePending: async (db, userId) => {
    await db.phoneVerificationCode.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: new Date() },
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
