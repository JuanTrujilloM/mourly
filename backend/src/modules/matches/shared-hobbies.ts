type WithHobbies = {
  profile: { hobbies: { hobby: { name: string } }[] } | null;
} | null;

const MAX_SHARED_HOBBIES = 3;

// The overlap: what both people like. The date page shows only this; the
// profile behind the match link also lists the partner's other hobbies.
export function sharedHobbyNames(
  viewer: WithHobbies,
  partner: WithHobbies,
): string[] {
  const partnerHobbies = new Set(
    partner?.profile?.hobbies.map((entry) => entry.hobby.name) ?? [],
  );
  return (viewer?.profile?.hobbies ?? [])
    .map((entry) => entry.hobby.name)
    .filter((name) => partnerHobbies.has(name))
    .slice(0, MAX_SHARED_HOBBIES);
}

// The partner's hobbies outside the overlap, in the partner's own order.
export function otherHobbyNames(
  viewer: WithHobbies,
  partner: WithHobbies,
): string[] {
  const viewerHobbies = new Set(
    viewer?.profile?.hobbies.map((entry) => entry.hobby.name) ?? [],
  );
  return (partner?.profile?.hobbies ?? [])
    .map((entry) => entry.hobby.name)
    .filter((name) => !viewerHobbies.has(name));
}
