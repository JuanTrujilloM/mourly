import { Recipient } from '../notifications/notification';

type UserWithProfile = {
  email: string;
  cellphone: string;
  profile: { name: string } | null;
};

export function nameOf(user: { profile: { name: string } | null }): string {
  return user.profile?.name ?? 'tu match';
}

export function recipientOf(user: UserWithProfile): Recipient {
  return {
    name: user.profile?.name ?? '',
    email: user.email,
    cellphone: user.cellphone,
  };
}
