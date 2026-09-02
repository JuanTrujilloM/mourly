export type InviteUser = {
  id: string;
  email: string;
  cellphone: string;
  profile: {
    name: string;
    dateOfBirth: Date;
    university: string;
    major: string;
    photos: { url: string; isPrimary: boolean }[];
  } | null;
};

export type MatchWithUsers = {
  id: string;
  userAId: string;
  userBId: string;
  userA: InviteUser;
  userB: InviteUser;
};

export const INVITE_USER_SELECT = {
  select: {
    id: true,
    email: true,
    cellphone: true,
    profile: {
      select: {
        name: true,
        dateOfBirth: true,
        university: true,
        major: true,
        photos: { select: { url: true, isPrimary: true } },
      },
    },
  },
};

export interface InviteResult {
  userId: string;
  cellphone: string;
  url: string;
}
