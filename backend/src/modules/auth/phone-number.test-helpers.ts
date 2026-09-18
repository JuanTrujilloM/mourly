import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { PhoneNumberService } from './phone-number.service';
import { UserLookupService } from './user-lookup.service';

export const CELLPHONE = '+573001112233';

interface PhoneNumberSetup {
  current?: { cellphone: string | null; cellphoneVerifiedAt: Date | null };
  smsVerification?: string;
}

export function setupPhoneNumber({
  current = { cellphone: null, cellphoneVerifiedAt: null },
  smsVerification,
}: PhoneNumberSetup = {}) {
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(current),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    phoneVerificationCode: {
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    $transaction: jest.fn((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    ),
  };
  const users = {
    isCellphoneVerifiedByAnother: jest.fn().mockResolvedValue(false),
  };
  const config = { get: jest.fn().mockReturnValue(smsVerification) };
  const service = new PhoneNumberService(
    prisma as unknown as PrismaService,
    users as unknown as UserLookupService,
    config as unknown as ConfigService,
  );
  return { service, prisma, users, config };
}
