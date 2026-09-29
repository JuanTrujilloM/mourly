import { ageFrom } from '../../common/utils/age';
import { firstName } from '../../common/utils/first-name';

export const FLOW_PARTNER_SELECTION = {
  select: {
    profile: {
      select: {
        name: true,
        dateOfBirth: true,
        university: true,
        major: true,
        semester: true,
        biography: true,
        photos: {
          select: { url: true, isPrimary: true },
          orderBy: { createdAt: 'asc' as const },
        },
        hobbies: { select: { hobby: { select: { name: true } } } },
      },
    },
  },
};

type Photo = { url: string; isPrimary: boolean };

type FlowPartnerProfile = {
  name: string;
  dateOfBirth: Date;
  university: string;
  major: string;
  semester: string;
  biography: string;
  photos: Photo[];
};

export interface FlowPartner {
  firstName: string;
  age: number;
  university: string;
  major: string;
  semester: string;
  biography: string;
  photos: string[];
}

export function toFlowPartner(profile: FlowPartnerProfile): FlowPartner {
  return {
    firstName: firstName(profile.name),
    age: ageFrom(profile.dateOfBirth),
    university: profile.university,
    major: profile.major,
    semester: profile.semester,
    biography: profile.biography,
    photos: primaryFirst(profile.photos),
  };
}

function primaryFirst(photos: Photo[]): string[] {
  return [
    ...photos.filter((photo) => photo.isPrimary),
    ...photos.filter((photo) => !photo.isPrimary),
  ].map((photo) => photo.url);
}
