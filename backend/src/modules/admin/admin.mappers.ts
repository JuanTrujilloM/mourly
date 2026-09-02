type UserWithProfile = {
  id: string;
  email: string;
  profile: { name: string; university: string } | null;
};

export function partnerSummary(user: UserWithProfile) {
  return {
    id: user.id,
    name: user.profile?.name ?? user.email,
    university: user.profile?.university ?? '—',
  };
}

export function intersection(a: string[], b: string[]): string[] {
  const other = new Set(b.map((item) => item.toLowerCase()));
  return a.filter((item) => other.has(item.toLowerCase()));
}

export function availabilityFor(
  rows: { userId: string; date: Date; timeSlot: string }[],
  userId: string,
) {
  return rows
    .filter((row) => row.userId === userId)
    .map((row) => ({ date: row.date, timeSlot: row.timeSlot }));
}
