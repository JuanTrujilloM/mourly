import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ReportsService } from './reports.service';

function setup(match: unknown = { userAId: 'u1', userBId: 'u2' }) {
  const findFirst = jest.fn().mockResolvedValue(match);
  const upsert = jest.fn().mockResolvedValue({ id: 'r1' });
  const prisma = {
    match: { findFirst },
    report: { upsert },
  } as unknown as PrismaService;

  return { service: new ReportsService(prisma), findFirst, upsert };
}

describe('ReportsService', () => {
  it('scopes the match lookup to the reporter', async () => {
    const { service, findFirst } = setup();

    await service.reportPartner('u1', 'm1', {});

    expect(findFirst.mock.calls[0][0].where).toMatchObject({
      id: 'm1',
      OR: [{ userAId: 'u1' }, { userBId: 'u1' }],
    });
  });

  it('hides a match the reporter is not part of behind a 404', async () => {
    const { service } = setup(null);

    await expect(service.reportPartner('intruder', 'm1', {})).rejects.toThrow(
      NotFoundException,
    );
  });

  it('reports the other user when the reporter is userA', async () => {
    const { service, upsert } = setup();

    await service.reportPartner('u1', 'm1', { reason: 'Comportamiento raro' });

    expect(upsert.mock.calls[0][0].create).toEqual({
      userAId: 'u1',
      userBId: 'u2',
      reason: 'Comportamiento raro',
    });
  });

  it('reports the other user when the reporter is userB', async () => {
    const { service, upsert } = setup();

    await service.reportPartner('u2', 'm1', {});

    expect(upsert.mock.calls[0][0].create).toMatchObject({
      userAId: 'u2',
      userBId: 'u1',
    });
  });

  it('is idempotent so a second report updates instead of duplicating', async () => {
    const { service, upsert } = setup();

    await service.reportPartner('u1', 'm1', { reason: 'Otra razón' });

    expect(upsert.mock.calls[0][0].where).toEqual({
      userAId_userBId: { userAId: 'u1', userBId: 'u2' },
    });
    expect(upsert.mock.calls[0][0].update).toEqual({ reason: 'Otra razón' });
  });

  it('stores a null reason when none is given', async () => {
    const { service, upsert } = setup();

    await service.reportPartner('u1', 'm1', {});

    expect(upsert.mock.calls[0][0].create.reason).toBeNull();
  });
});
