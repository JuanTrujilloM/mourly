import { areMutuallyEligible } from './eligibility';
import { makeCandidate } from './test-helpers';

const EVERY_GENDER = ['Hombres', 'Mujeres', 'No binario'];

describe('areMutuallyEligible', () => {
  it('accepts a mutually-attracted, in-range, no-history pair', () => {
    const man = makeCandidate({ userId: 'm' });
    const woman = makeCandidate({
      userId: 'w',
      gender: 'Femenino',
      genderInterests: ['Hombres'],
    });
    expect(areMutuallyEligible(man, woman)).toBe(true);
  });

  it('rejects when attraction is not mutual', () => {
    const man = makeCandidate({ userId: 'm', genderInterests: ['Mujeres'] });
    const otherMan = makeCandidate({
      userId: 'm2',
      genderInterests: ['Mujeres'],
    });
    expect(areMutuallyEligible(man, otherMan)).toBe(false);
  });

  it('accepts any of several selected genders', () => {
    const viewer = makeCandidate({
      userId: 'v',
      gender: 'Femenino',
      genderInterests: ['Mujeres', 'No binario'],
    });
    const nonBinary = makeCandidate({
      userId: 'n',
      gender: 'No binario',
      genderInterests: ['Mujeres'],
    });
    expect(areMutuallyEligible(viewer, nonBinary)).toBe(true);
  });

  it('accepts anyone when a user selected every gender', () => {
    const open = makeCandidate({ userId: 'o', genderInterests: EVERY_GENDER });
    const partner = makeCandidate({
      userId: 'p',
      gender: 'No binario',
      genderInterests: EVERY_GENDER,
    });
    expect(areMutuallyEligible(open, partner)).toBe(true);
  });

  it('matches an undisclosed gender only with someone open to every gender', () => {
    const undisclosed = makeCandidate({
      userId: 'u',
      gender: 'Prefiero no decir',
      genderInterests: ['Hombres'],
    });
    const open = makeCandidate({ userId: 'o', genderInterests: EVERY_GENDER });
    const specific = makeCandidate({
      userId: 's',
      genderInterests: ['Hombres'],
    });
    expect(areMutuallyEligible(undisclosed, open)).toBe(true);
    expect(areMutuallyEligible(undisclosed, specific)).toBe(false);
  });

  it('rejects when either user is outside the other age band', () => {
    const young = makeCandidate({ userId: 'y', age: 19, maxAge: 21 });
    const older = makeCandidate({
      userId: 'o',
      gender: 'Femenino',
      genderInterests: ['Hombres'],
      age: 28,
    });
    expect(areMutuallyEligible(young, older)).toBe(false);
  });

  it('enforces same university when either side requires it', () => {
    const a = makeCandidate({ userId: 'a', requiresSameUniversity: true });
    const b = makeCandidate({
      userId: 'b',
      gender: 'Femenino',
      genderInterests: ['Hombres'],
      university: 'UPB',
    });
    expect(areMutuallyEligible(a, b)).toBe(false);
  });

  it('never repeats a previous match (no-repeat rule)', () => {
    const a = makeCandidate({ userId: 'a', priorPartnerIds: new Set(['b']) });
    const b = makeCandidate({
      userId: 'b',
      gender: 'Femenino',
      genderInterests: ['Hombres'],
    });
    expect(areMutuallyEligible(a, b)).toBe(false);
  });

  it('is symmetric — order of arguments does not change the verdict', () => {
    const a = makeCandidate({ userId: 'a', requiresSameUniversity: true });
    const b = makeCandidate({
      userId: 'b',
      gender: 'Femenino',
      genderInterests: ['Hombres'],
      university: 'UPB',
    });
    expect(areMutuallyEligible(a, b)).toBe(areMutuallyEligible(b, a));
  });
});
