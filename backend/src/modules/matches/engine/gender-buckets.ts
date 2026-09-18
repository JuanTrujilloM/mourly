import { acceptsGender, areMutuallyEligible } from './eligibility';
import { MatchCandidate } from './types';

type CandidatePair = [MatchCandidate, MatchCandidate];

function bucketIndexesByGender(
  candidates: MatchCandidate[],
): Map<string, number[]> {
  const buckets = new Map<string, number[]>();
  candidates.forEach((candidate, index) => {
    const bucket = buckets.get(candidate.gender) ?? [];
    bucket.push(index);
    buckets.set(candidate.gender, bucket);
  });
  return buckets;
}

export function* eligiblePairs(
  candidates: MatchCandidate[],
): Generator<CandidatePair> {
  const buckets = bucketIndexesByGender(candidates);
  for (let i = 0; i < candidates.length; i++) {
    const viewer = candidates[i];
    for (const [gender, indexes] of buckets) {
      if (!acceptsGender(viewer, gender)) continue;
      for (const j of indexes) {
        if (j <= i) continue;
        const other = candidates[j];
        if (areMutuallyEligible(viewer, other)) yield [viewer, other];
      }
    }
  }
}
