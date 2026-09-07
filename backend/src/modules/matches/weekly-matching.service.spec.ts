import { Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CandidateLoaderService } from './candidate-loader.service';
import { MatchInviteService } from './match-invite.service';
import { WeeklyMatchingService } from './weekly-matching.service';
import { MatchCandidate } from './engine/types';

function candidate(
  userId: string,
  gender: string,
  genderInterests: string[],
): MatchCandidate {
  return {
    userId,
    gender,
    genderInterests,
    age: 23,
    minAge: 18,
    maxAge: 30,
    university: 'EAFIT',
    requiresSameUniversity: false,
    relationshipType: 'Seria',
    major: 'Derecho',
    semester: '6',
    height: 170,
    heightRange: 'Indiferente',
    vibes: ['tranquila'],
    hobbies: ['cine'],
    biographyTokens: ['cine'],
    reliability: 0,
    priorPartnerIds: new Set<string>(),
  };
}

function setup(candidates: MatchCandidate[] = []) {
  const createMany = jest.fn().mockResolvedValue({ count: 1 });
  const prisma = { match: { createMany } } as unknown as PrismaService;
  const loader = { load: jest.fn().mockResolvedValue(candidates) };
  const invites = { inviteForPairs: jest.fn().mockResolvedValue(undefined) };

  const service = new WeeklyMatchingService(
    prisma,
    loader as unknown as CandidateLoaderService,
    invites as unknown as MatchInviteService,
  );
  return { service, createMany, loader, invites };
}

describe('WeeklyMatchingService', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('writes nothing when nobody is eligible', async () => {
    const { service, createMany } = setup([]);

    expect(await service.runWeeklyMatching()).toEqual([]);
    expect(createMany).not.toHaveBeenCalled();
  });

  it('persists the pairs the engine produced as pending', async () => {
    const { service, createMany } = setup([
      candidate('m', 'Masculino', ['Mujeres']),
      candidate('w', 'Femenino', ['Hombres']),
    ]);

    const pairs = await service.runWeeklyMatching();

    expect(pairs).toHaveLength(1);
    expect(createMany.mock.calls[0][0].data[0]).toMatchObject({
      status: 'pending',
    });
  });

  it('invites every created pair after the cron run', async () => {
    const { service, invites } = setup([
      candidate('m', 'Masculino', ['Mujeres']),
      candidate('w', 'Femenino', ['Hombres']),
    ]);

    await service.handleWeeklyCron();

    expect(invites.inviteForPairs).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ userAId: 'm' })]),
    );
  });

  it('still runs the invite step when nothing matched', async () => {
    const { service, invites } = setup([]);

    await service.handleWeeklyCron();

    expect(invites.inviteForPairs).toHaveBeenCalledWith([]);
  });
});
