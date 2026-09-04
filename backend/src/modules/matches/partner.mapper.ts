import { ageFrom } from '../../common/utils/age';

type PartnerSource = {
  profile: {
    name: string;
    dateOfBirth: Date;
    university: string;
    major: string;
    biography: string;
    photos: { url: string; isPrimary: boolean }[];
  } | null;
} | null;

export type PartnerSummary = {
  name: string;
  age: number;
  university: string;
  major: string;
  biography: string;
  photoUrl: string | null;
};

export function toPartnerSummary(user: PartnerSource): PartnerSummary | null {
  const profile = user?.profile;
  if (!profile) {
    return null;
  }

  const primary =
    profile.photos.find((photo) => photo.isPrimary) ?? profile.photos[0];

  return {
    name: profile.name,
    age: ageFrom(profile.dateOfBirth),
    university: profile.university,
    major: profile.major,
    biography: profile.biography,
    photoUrl: primary?.url ?? null,
  };
}
