import { ageFrom } from '../../common/utils/age';
import type { PartnerSummary } from './notification';

type PartnerProfile = {
  name: string;
  dateOfBirth: Date;
  university: string;
  major: string;
  photos: { url: string; isPrimary: boolean }[];
} | null;

const UNKNOWN_PARTNER: PartnerSummary = {
  name: 'tu match',
  age: null,
  university: null,
  major: null,
  photoUrl: null,
};

export function buildPartnerSummary(profile: PartnerProfile): PartnerSummary {
  if (!profile) {
    return UNKNOWN_PARTNER;
  }

  const primary =
    profile.photos.find((photo) => photo.isPrimary) ?? profile.photos[0];

  return {
    name: profile.name,
    age: ageFrom(profile.dateOfBirth),
    university: profile.university,
    major: profile.major,
    photoUrl: primary?.url ?? null,
  };
}
