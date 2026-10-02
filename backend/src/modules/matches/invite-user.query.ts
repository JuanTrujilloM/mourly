export type InviteUser = {
  id: string;
  email: string;
  cellphone: string | null;
  profile: {
    name: string;
    dateOfBirth: Date;
    university: string;
    major: string;
    photos: { key: string; isPrimary: boolean }[];
  } | null;
};

export type MatchWithUsers = {
  id: string;
  userAId: string;
  userBId: string;
  userA: InviteUser;
  userB: InviteUser;
};

const INVITE_USER_SELECT = {
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
        photos: { select: { key: true, isPrimary: true } },
      },
    },
  },
};

export const MATCH_WITH_USERS_SELECT = {
  id: true,
  userAId: true,
  userBId: true,
  userA: INVITE_USER_SELECT,
  userB: INVITE_USER_SELECT,
};

export interface InviteResult {
  userId: string;
  cellphone: string | null;
  url: string;
}
