export function ageFrom(dateOfBirth: Date): number {
  const now = new Date();
  const monthDelta = now.getUTCMonth() - dateOfBirth.getUTCMonth();
  const beforeBirthday =
    monthDelta < 0 ||
    (monthDelta === 0 && now.getUTCDate() < dateOfBirth.getUTCDate());

  return (
    now.getUTCFullYear() -
    dateOfBirth.getUTCFullYear() -
    (beforeBirthday ? 1 : 0)
  );
}
