import { areMutuallyEligible } from './eligibility';
import { eligiblePairs } from './gender-buckets';
import { makeCandidate } from './test-helpers';
import { MatchCandidate } from './types';

const GENDERS = ['Masculino', 'Femenino', 'No binario', 'Otro'];
const INTEREST_SETS = [
  ['Mujeres'],
  ['Hombres'],
  ['No binario'],
  ['Hombres', 'Mujeres'],
  ['Hombres', 'Mujeres', 'No binario'],
];

function bruteForcePairs(candidates: MatchCandidate[]): string[] {
  const pairs: string[] = [];
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      if (areMutuallyEligible(candidates[i], candidates[j])) {
        pairs.push(`${candidates[i].userId}-${candidates[j].userId}`);
      }
    }
  }
  return pairs.sort();
}

function pairKeys(candidates: MatchCandidate[]): string[] {
  return [...eligiblePairs(candidates)]
    .map(([a, b]) => `${a.userId}-${b.userId}`)
    .sort();
}

function mixedPool(size: number): MatchCandidate[] {
  return Array.from({ length: size }, (_, index) =>
    makeCandidate({
      userId: `u${index}`,
      gender: GENDERS[index % GENDERS.length],
      genderInterests: INTEREST_SETS[(index * 7) % INTEREST_SETS.length],
      age: 18 + (index % 9),
    }),
  );
}

describe('eligiblePairs', () => {
  it('yields exactly the pairs a full comparison would find', () => {
    const pool = mixedPool(60);

    expect(pairKeys(pool)).toEqual(bruteForcePairs(pool));
  });

  it('yields each pair once, in candidate order', () => {
    const man = makeCandidate({ userId: 'm' });
    const woman = makeCandidate({
      userId: 'w',
      gender: 'Femenino',
      genderInterests: ['Hombres'],
    });

    expect(pairKeys([man, woman])).toEqual(['m-w']);
  });

  it('skips genders the viewer is not interested in', () => {
    const men = [
      makeCandidate({ userId: 'm1' }),
      makeCandidate({ userId: 'm2' }),
    ];

    expect(pairKeys(men)).toEqual([]);
  });
});
