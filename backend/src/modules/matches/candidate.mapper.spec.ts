import { splitCsv, tokenizeBiography, toCandidate } from './candidate.mapper';

const LOADED = {
  id: 'u1',
  profile: {
    gender: 'Femenino',
    dateOfBirth: new Date('2003-01-01'),
    university: 'EAFIT',
    major: 'Derecho',
    semester: '6',
    height: 166,
    biography: 'Soy una persona que ama viajar y el cine',
    hobbies: [{ hobby: { name: 'Cine' } }, { hobby: { name: 'Viajar' } }],
  },
  preferences: {
    genderInterest: 'Hombres',
    minAge: 20,
    maxAge: 28,
    sameUniversity: false,
    relationshipType: 'Seria',
    heightRange: 'Indiferente',
    energyVibe: 'Tranquilo/a, Romantico/a',
  },
};

describe('splitCsv', () => {
  it('splits, trims and lowercases', () => {
    expect(splitCsv('Tranquilo/a,  Romantico/a ')).toEqual([
      'tranquilo/a',
      'romantico/a',
    ]);
  });

  it('drops empty segments', () => {
    expect(splitCsv(' , ,Cine')).toEqual(['cine']);
  });

  it('returns an empty list for an empty string', () => {
    expect(splitCsv('')).toEqual([]);
  });
});

describe('tokenizeBiography', () => {
  it('drops stop words and short words', () => {
    expect(tokenizeBiography('Soy una persona que ama viajar')).toEqual([
      'persona',
      'ama',
      'viajar',
    ]);
  });

  it('deduplicates repeated words', () => {
    expect(tokenizeBiography('cine cine cine')).toEqual(['cine']);
  });

  it('keeps accented Spanish words', () => {
    expect(tokenizeBiography('música')).toEqual(['música']);
  });

  it('returns nothing for a bio of only stop words', () => {
    expect(tokenizeBiography('que los las')).toEqual([]);
  });
});

describe('toCandidate', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('flattens the profile and preferences into engine input', () => {
    const candidate = toCandidate(LOADED, new Set(['u9']), 0.5);

    expect(candidate).toMatchObject({
      userId: 'u1',
      gender: 'Femenino',
      genderInterest: 'Hombres',
      age: 23,
      university: 'EAFIT',
      requiresSameUniversity: false,
      reliability: 0.5,
    });
  });

  it('lowercases hobby names for comparison', () => {
    expect(toCandidate(LOADED, new Set(), 0).hobbies).toEqual([
      'cine',
      'viajar',
    ]);
  });

  it('splits the stored vibe csv back into a list', () => {
    expect(toCandidate(LOADED, new Set(), 0).vibes).toEqual([
      'tranquilo/a',
      'romantico/a',
    ]);
  });

  it('carries the prior partner set through', () => {
    expect(toCandidate(LOADED, new Set(['u9']), 0).priorPartnerIds).toEqual(
      new Set(['u9']),
    );
  });
});
