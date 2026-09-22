type WithHobbies = {
  profile: { hobbies: { hobby: { name: string } }[] } | null;
} | null;

const MAX_SHARED_HOBBIES = 3;

// Only the overlap is ever shown: a hobby the viewer does not have stays private.
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
