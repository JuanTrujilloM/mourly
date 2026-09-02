// The weekly match runs Thursdays 7pm Colombia (UTC-5), which is Friday 00:00 UTC.
// Mirror of WEEKLY_MATCHING_CRON ('0 19 * * 4', America/Bogota) in
// backend/src/modules/matches/weekly-matching.constants.ts; keep in sync with it.
export function nextMatchDrop(from: Date = new Date()): Date {
  const daysUntilFriday = (12 - from.getUTCDay()) % 7;
  const candidate = new Date(
    Date.UTC(
      from.getUTCFullYear(),
      from.getUTCMonth(),
      from.getUTCDate() + daysUntilFriday,
      0,
      0,
      0,
      0,
    ),
  );
  // daysUntilFriday is 0 on Fridays, so a same-day past instant rolls to next week.
  if (candidate.getTime() <= from.getTime()) {
    candidate.setUTCDate(candidate.getUTCDate() + 7);
  }
  return candidate;
}
