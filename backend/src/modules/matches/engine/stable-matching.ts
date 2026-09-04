import { areMutuallyEligible } from './eligibility';
import { compatibilityScore } from './scoring';
import { MatchCandidate, MatchPair } from './types';

interface ScoredEdge {
  aId: string;
  bId: string;
  score: number;
}

function compareEdges(x: ScoredEdge, y: ScoredEdge): number {
  if (y.score !== x.score) return y.score - x.score;
  if (x.aId !== y.aId) return x.aId < y.aId ? -1 : 1;
  return x.bId < y.bId ? -1 : 1;
}

export function stableMatch(candidates: MatchCandidate[]): MatchPair[] {
  const edges: ScoredEdge[] = [];
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const a = candidates[i];
      const b = candidates[j];
      if (!areMutuallyEligible(a, b)) continue;
      const [aId, bId] =
        a.userId < b.userId ? [a.userId, b.userId] : [b.userId, a.userId];
      edges.push({ aId, bId, score: compatibilityScore(a, b) });
    }
  }

  edges.sort(compareEdges);

  const taken = new Set<string>();
  const pairs: MatchPair[] = [];
  for (const edge of edges) {
    if (taken.has(edge.aId) || taken.has(edge.bId)) continue;
    taken.add(edge.aId);
    taken.add(edge.bId);
    pairs.push({
      userAId: edge.aId,
      userBId: edge.bId,
      compatibilityScore: edge.score,
    });
  }

  return pairs;
}
