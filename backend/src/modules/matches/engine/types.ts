export interface MatchCandidate {
  userId: string;

  gender: string;
  genderInterests: string[];
  age: number;
  minAge: number;
  maxAge: number;
  university: string;
  requiresSameUniversity: boolean;

  relationshipType: string;
  major: string;
  semester: string;
  height: number;
  heightRange: string;
  vibes: string[];
  hobbies: string[];
  biographyTokens: string[];
  reliability: number;

  priorPartnerIds: Set<string>;
}

export interface MatchPair {
  userAId: string;
  userBId: string;
  compatibilityScore: number;
}
