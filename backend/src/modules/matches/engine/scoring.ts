import {
  SCORE_WEIGHTS,
  MAX_SCORED_SHARED_HOBBIES,
  SIMILAR_HEIGHT_CM,
} from '../weekly-matching.constants';
import { MatchCandidate } from './types';

function intersectionSize(a: string[], b: string[]): number {
  const other = new Set(b);
  return a.filter((item) => other.has(item)).length;
}

function sharedHobbyTerm(a: MatchCandidate, b: MatchCandidate): number {
  const shared = intersectionSize(a.hobbies, b.hobbies);
  return (
    Math.min(shared, MAX_SCORED_SHARED_HOBBIES) / MAX_SCORED_SHARED_HOBBIES
  );
}

function relationshipTerm(a: MatchCandidate, b: MatchCandidate): number {
  if (a.relationshipType === b.relationshipType) return 1;
  const OPEN = 'Abierto a todo';
  if (a.relationshipType === OPEN || b.relationshipType === OPEN) return 0.5;
  return 0;
}

function majorTerm(a: MatchCandidate, b: MatchCandidate): number {
  return a.major === b.major ? 1 : 0;
}

function semesterTerm(a: MatchCandidate, b: MatchCandidate): number {
  const na = Number(a.semester);
  const nb = Number(b.semester);
  if (Number.isNaN(na) || Number.isNaN(nb)) {
    return a.semester === b.semester ? 1 : 0;
  }
  return Math.max(0, 1 - Math.abs(na - nb) / 9);
}

function biographyTerm(a: MatchCandidate, b: MatchCandidate): number {
  if (a.biographyTokens.length === 0 || b.biographyTokens.length === 0)
    return 0;
  const shared = intersectionSize(a.biographyTokens, b.biographyTokens);
  const smaller = Math.min(a.biographyTokens.length, b.biographyTokens.length);
  return shared / smaller;
}

function heightPreferenceMet(
  viewer: MatchCandidate,
  target: MatchCandidate,
): boolean {
  const delta = target.height - viewer.height;
  switch (viewer.heightRange) {
    case 'Más alta':
      return delta > 0;
    case 'Más baja':
      return delta < 0;
    case 'Similar':
      return Math.abs(delta) <= SIMILAR_HEIGHT_CM;
    default:
      return true;
  }
}

function heightTerm(a: MatchCandidate, b: MatchCandidate): number {
  const aOk = heightPreferenceMet(a, b) ? 1 : 0;
  const bOk = heightPreferenceMet(b, a) ? 1 : 0;
  return (aOk + bOk) / 2;
}

function vibeTerm(a: MatchCandidate, b: MatchCandidate): number {
  if (a.vibes.length === 0 || b.vibes.length === 0) return 0;
  const shared = intersectionSize(a.vibes, b.vibes);
  return shared / Math.min(a.vibes.length, b.vibes.length);
}

function feedbackTerm(a: MatchCandidate, b: MatchCandidate): number {
  const average = (a.reliability + b.reliability) / 2;
  return (average + 1) / 2;
}

export function compatibilityScore(
  a: MatchCandidate,
  b: MatchCandidate,
): number {
  const score =
    SCORE_WEIGHTS.sharedHobbies * sharedHobbyTerm(a, b) +
    SCORE_WEIGHTS.relationshipType * relationshipTerm(a, b) +
    SCORE_WEIGHTS.sameMajor * majorTerm(a, b) +
    SCORE_WEIGHTS.semesterProximity * semesterTerm(a, b) +
    SCORE_WEIGHTS.biography * biographyTerm(a, b) +
    SCORE_WEIGHTS.height * heightTerm(a, b) +
    SCORE_WEIGHTS.vibe * vibeTerm(a, b) +
    SCORE_WEIGHTS.feedback * feedbackTerm(a, b);

  return Math.round(score * 10000) / 10000;
}
