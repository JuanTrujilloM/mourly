import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma.service';
import {
  MAX_ATTEMPTS,
  VerificationCodeService,
} from './verification-code.service';

function setup() {
  const table = {
    findLatestPending: jest.fn().mockResolvedValue(null),
    retirePending: jest.fn(),
    create: jest.fn(),
    claimAttempt: jest.fn().mockResolvedValue(true),
    consume: jest.fn().mockResolvedValue(undefined),
  };
  const prisma = {} as PrismaService;
  const service = new VerificationCodeService(prisma, table);
  return { service, table, prisma };
}

function activeCode(overrides: Record<string, unknown> = {}) {
  return {
    id: 'code-1',
    codeHash: bcrypt.hashSync('123456', 4),
    expiresAt: new Date(Date.now() + 60_000),
    attempts: 0,
    resendCount: 0,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('VerificationCodeService.validate', () => {
  it('reports not_found when no active code exists', async () => {
    const { service } = setup();

    expect(await service.validate('u1', '123456')).toBe('not_found');
  });

  it('reports expired for a stale code', async () => {
    const { service, table } = setup();
    table.findLatestPending.mockResolvedValue(
      activeCode({ expiresAt: new Date(Date.now() - 1000) }),
    );

    expect(await service.validate('u1', '123456')).toBe('expired');
  });

  it('does not spend an attempt on an expired code', async () => {
    const { service, table } = setup();
    table.findLatestPending.mockResolvedValue(
      activeCode({ expiresAt: new Date(Date.now() - 1000) }),
    );

    await service.validate('u1', '123456');

    expect(table.claimAttempt).not.toHaveBeenCalled();
  });

  it('locks the code when no attempt is left to claim, even with the right code', async () => {
    const { service, table } = setup();
    table.findLatestPending.mockResolvedValue(activeCode());
    table.claimAttempt.mockResolvedValue(false);

    expect(await service.validate('u1', '123456')).toBe('too_many_attempts');
    expect(table.consume).not.toHaveBeenCalled();
  });

  it('spends a claimed attempt on a wrong code', async () => {
    const { service, table, prisma } = setup();
    table.findLatestPending.mockResolvedValue(activeCode());

    expect(await service.validate('u1', '999999')).toBe('mismatch');
    expect(table.claimAttempt).toHaveBeenCalledWith(
      prisma,
      'code-1',
      MAX_ATTEMPTS,
    );
    expect(table.consume).not.toHaveBeenCalled();
  });

  it('consumes the code on a correct match', async () => {
    const { service, table, prisma } = setup();
    table.findLatestPending.mockResolvedValue(activeCode());

    expect(await service.validate('u1', '123456')).toBe('ok');
    expect(table.consume).toHaveBeenCalledWith(prisma, 'code-1');
  });
});
