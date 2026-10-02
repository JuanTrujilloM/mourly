import { ageFrom } from '../../common/utils/age';
import type { PartnerSummary } from './notification';

type PartnerProfile = {
  name: string;
  dateOfBirth: Date;
  university: string;
  major: string;
} | null;

export const UNKNOWN_PARTNER_NAME = 'tu match';

const UNKNOWN_PARTNER: PartnerSummary = {
  name: UNKNOWN_PARTNER_NAME,
  age: null,
  university: null,
  major: null,
  photoUrl: null,
};

export function buildPartnerSummary(
  profile: PartnerProfile,
  photoUrl: string | null,
): PartnerSummary {
  if (!profile) {
    return UNKNOWN_PARTNER;
  }

  return {
    name: profile.name,
    age: ageFrom(profile.dateOfBirth),
    university: profile.university,
    major: profile.major,
    photoUrl,
  };
}
