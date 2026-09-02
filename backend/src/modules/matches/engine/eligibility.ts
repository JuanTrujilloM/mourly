import { MatchCandidate } from './types';

const GENDER_TO_INTEREST: Record<string, string> = {
  Masculino: 'Hombres',
  Femenino: 'Mujeres',
  'No binario': 'No binario',
};

function attractedTo(viewer: MatchCandidate, target: MatchCandidate): boolean {
  if (viewer.genderInterest === 'Todos') return true;
  return GENDER_TO_INTEREST[target.gender] === viewer.genderInterest;
}

function agesMutuallyInRange(a: MatchCandidate, b: MatchCandidate): boolean {
  return (
    b.age >= a.minAge &&
    b.age <= a.maxAge &&
    a.age >= b.minAge &&
    a.age <= b.maxAge
  );
}

function universityConstraintMet(
  a: MatchCandidate,
  b: MatchCandidate,
): boolean {
  if (a.requiresSameUniversity || b.requiresSameUniversity) {
    return a.university === b.university;
  }
  return true;
}

export function areMutuallyEligible(
  a: MatchCandidate,
  b: MatchCandidate,
): boolean {
  if (a.userId === b.userId) return false;
  if (a.priorPartnerIds.has(b.userId)) return false;
  if (b.priorPartnerIds.has(a.userId)) return false;

  return (
    attractedTo(a, b) &&
    attractedTo(b, a) &&
    agesMutuallyInRange(a, b) &&
    universityConstraintMet(a, b)
  );
}
