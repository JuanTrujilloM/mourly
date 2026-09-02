import { stableMatch } from './stable-matching';
import { makeCandidate } from './test-helpers';

const man = (id: string, over = {}) =>
  makeCandidate({
    userId: id,
    gender: 'Masculino',
    genderInterest: 'Mujeres',
    ...over,
  });
const woman = (id: string, over = {}) =>
  makeCandidate({
    userId: id,
    gender: 'Femenino',
    genderInterest: 'Hombres',
    ...over,
  });

describe('stableMatch', () => {
  it('pairs a single eligible couple exactly once', () => {
    const pairs = stableMatch([man('m'), woman('w')]);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toMatchObject({ userAId: 'm', userBId: 'w' });
  });

  it('assigns each user at most one partner', () => {
    const pairs = stableMatch([man('m1'), man('m2'), woman('w1'), woman('w2')]);
    const assigned = pairs.flatMap((p) => [p.userAId, p.userBId]);
    expect(new Set(assigned).size).toBe(assigned.length);
  });

  it('prefers the higher-scoring partner (maximizes compatibility)', () => {
    const m = man('m', { hobbies: ['cine', 'gym'] });
    const w1 = woman('w1', { hobbies: ['cine', 'gym'] });
    const w2 = woman('w2', { hobbies: ['ajedrez'] });
    const pairs = stableMatch([m, w1, w2]);
    const mPair = pairs.find((p) => p.userAId === 'm' || p.userBId === 'm');
    const partner = mPair?.userAId === 'm' ? mPair?.userBId : mPair?.userAId;
    expect(partner).toBe('w1');
  });

  it('leaves users with no eligible partner unmatched', () => {
    const pairs = stableMatch([man('m1'), man('m2')]);
    expect(pairs).toHaveLength(0);
  });

  it('never re-pairs users from a previous week', () => {
    const m = man('m', { priorPartnerIds: new Set(['w1']) });
    const w1 = woman('w1', { priorPartnerIds: new Set(['m']) });
    const w2 = woman('w2');
    const pairs = stableMatch([m, w1, w2]);
    const mPair = pairs.find((p) => p.userAId === 'm' || p.userBId === 'm');
    const partner = mPair?.userAId === 'm' ? mPair?.userBId : mPair?.userAId;
    expect(partner).toBe('w2');
  });

  it('produces a stable matching with no blocking pair', () => {
    const m1 = man('m1', { hobbies: ['a', 'b'] });
    const m2 = man('m2', { hobbies: ['c'] });
    const w1 = woman('w1', { hobbies: ['a', 'b'] });
    const w2 = woman('w2', { hobbies: ['d'] });
    const pairs = stableMatch([m1, m2, w1, w2]);
    const partnerOf = (id: string) => {
      const p = pairs.find((x) => x.userAId === id || x.userBId === id);
      return p?.userAId === id ? p?.userBId : p?.userAId;
    };
    expect(partnerOf('m1')).toBe('w1');
    expect(partnerOf('m2')).toBe('w2');
  });
});
