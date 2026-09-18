import { CANDIDATE_ROW, setupCandidateLoader as setup } from './test-helpers';

describe('CandidateLoaderService', () => {
  it('filters busy users inside the query rather than in memory', async () => {
    const { service, findMany } = setup();

    await service.load();

    const where = findMany.mock.calls[0][0].where as Record<string, unknown>;
    expect(where.matchesAsUserA).toEqual({
      none: { status: { in: ['pending', 'confirmed'] } },
    });
    expect(where.matchesAsUserB).toEqual({
      none: { status: { in: ['pending', 'confirmed'] } },
    });
  });

  it('only considers verified, searching, fully onboarded users', async () => {
    const { service, findMany } = setup();

    await service.load();

    const where = findMany.mock.calls[0][0].where as Record<string, unknown>;
    expect(where.isVerified).toBe(true);
    expect(where.cellphoneVerifiedAt).toEqual({ not: null });
    expect(where.profile).toEqual({ is: { status: 'SEARCHING' } });
    expect(where.preferences).toEqual({ isNot: null });
  });

  it('maps loaded rows into engine candidates', async () => {
    const { service } = setup();

    const candidates = await service.load();

    expect(candidates).toHaveLength(1);
    expect(candidates[0].userId).toBe('u1');
  });

  it('skips a row missing its profile or preferences', async () => {
    const { service } = setup([
      { ...CANDIDATE_ROW, profile: null },
      { ...CANDIDATE_ROW, id: 'u2', preferences: null },
    ]);

    expect(await service.load()).toHaveLength(0);
  });

  it('defaults reliability and prior partners when absent', async () => {
    const { service } = setup();

    const candidates = await service.load();

    expect(candidates[0].reliability).toBe(0);
    expect(candidates[0].priorPartnerIds.size).toBe(0);
  });

  it('passes the loaded ids to the history lookups', async () => {
    const { service, history } = setup();

    await service.load();

    expect(history.priorPartnersByUser).toHaveBeenCalledWith(['u1']);
    expect(history.reliabilityByUser).toHaveBeenCalledWith(['u1']);
  });
});
