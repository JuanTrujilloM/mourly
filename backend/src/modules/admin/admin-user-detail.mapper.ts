import { ageFrom } from '../../common/utils/age';

export const PROFILE_DETAIL_INCLUDE = {
  include: { photos: true, hobbies: { include: { hobby: true } } },
} as const;

type DetailUser = {
  id: string;
  email: string;
  isVerified: boolean;
  profile: {
    name: string;
    dateOfBirth: Date;
    gender: string;
    height: number;
    biography: string;
    university: string;
    major: string;
    semester: string;
    status: string;
    photos: { url: string; isPrimary: boolean }[];
    hobbies: { hobby: { name: string } }[];
  } | null;
  preferences: {
    relationshipType: string;
    orientation: string;
    minAge: number;
    maxAge: number;
    genderInterest: string;
    sameUniversity: boolean;
    heightRange: string;
    energyVibe: string;
  } | null;
};

function mapPreferences(preferences: DetailUser['preferences']) {
  if (!preferences) {
    return null;
  }
  return {
    relationshipType: preferences.relationshipType,
    orientation: preferences.orientation,
    minAge: preferences.minAge,
    maxAge: preferences.maxAge,
    genderInterest: preferences.genderInterest,
    sameUniversity: preferences.sameUniversity,
    heightRange: preferences.heightRange,
    energyVibe: preferences.energyVibe,
  };
}

export function mapUserDetail(user: DetailUser) {
  const profile = user.profile;
  const photos = profile?.photos ?? [];
  const primary = photos.find((photo) => photo.isPrimary) ?? photos[0];

  return {
    id: user.id,
    email: user.email,
    isVerified: user.isVerified,
    name: profile?.name ?? user.email,
    age: profile ? ageFrom(profile.dateOfBirth) : null,
    gender: profile?.gender ?? null,
    height: profile?.height ?? null,
    biography: profile?.biography ?? null,
    university: profile?.university ?? null,
    major: profile?.major ?? null,
    semester: profile?.semester ?? null,
    status: profile?.status ?? null,
    primaryPhoto: primary?.url ?? null,
    photos: photos.map((photo) => photo.url),
    hobbies: profile?.hobbies.map((entry) => entry.hobby.name) ?? [],
    preferences: mapPreferences(user.preferences),
  };
}
