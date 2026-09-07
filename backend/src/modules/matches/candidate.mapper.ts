import { ageFrom } from '../../common/utils/age';
import { MatchCandidate } from './engine/types';

const BIO_STOP_WORDS = new Set([
  'que',
  'los',
  'las',
  'una',
  'uno',
  'con',
  'por',
  'para',
  'del',
  'este',
  'esta',
  'como',
  'más',
  'mas',
  'pero',
  'muy',
  'and',
  'the',
  'soy',
  'amo',
]);

export type LoadedCandidate = {
  id: string;
  profile: {
    gender: string;
    dateOfBirth: Date;
    university: string;
    major: string;
    semester: string;
    height: number;
    biography: string;
    hobbies: { hobby: { name: string } }[];
  } | null;
  preferences: {
    genderInterests: string[];
    minAge: number;
    maxAge: number;
    sameUniversity: boolean;
    relationshipType: string;
    heightRange: string;
    energyVibe: string;
  } | null;
};

export function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 0);
}

export function tokenizeBiography(biography: string): string[] {
  const tokens = biography
    .toLowerCase()
    .split(/[^a-záéíóúñü]+/i)
    .filter((word) => word.length > 2 && !BIO_STOP_WORDS.has(word));
  return [...new Set(tokens)];
}

export function toCandidate(
  user: LoadedCandidate,
  priorPartnerIds: Set<string>,
  reliability: number,
): MatchCandidate {
  const profile = user.profile!;
  const preferences = user.preferences!;

  return {
    userId: user.id,
    gender: profile.gender,
    genderInterests: preferences.genderInterests,
    age: ageFrom(profile.dateOfBirth),
    minAge: preferences.minAge,
    maxAge: preferences.maxAge,
    university: profile.university,
    requiresSameUniversity: preferences.sameUniversity,
    relationshipType: preferences.relationshipType,
    major: profile.major,
    semester: profile.semester,
    height: profile.height,
    heightRange: preferences.heightRange,
    vibes: splitCsv(preferences.energyVibe),
    hobbies: profile.hobbies.map((entry) => entry.hobby.name.toLowerCase()),
    biographyTokens: tokenizeBiography(profile.biography),
    reliability,
    priorPartnerIds,
  };
}
