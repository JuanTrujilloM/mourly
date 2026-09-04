// The weekly match moment is Thursday 19:00 in Colombia. Colombia has no
// daylight saving (UTC-5 all year), so that instant is Friday 00:00 UTC and
// the math can stay in UTC without a time-zone library.
const MATCH_UTC_WEEKDAY = 5;

export function nextMatchMoment(now: Date): Date {
  const candidate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const daysAhead = (MATCH_UTC_WEEKDAY - candidate.getUTCDay() + 7) % 7;
  candidate.setUTCDate(candidate.getUTCDate() + daysAhead);
  if (candidate.getTime() <= now.getTime()) {
    candidate.setUTCDate(candidate.getUTCDate() + 7);
  }
  return candidate;
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
}

export function countdownParts(now: Date, target: Date): CountdownParts {
  const totalMinutes = Math.max(
    0,
    Math.floor((target.getTime() - now.getTime()) / 60_000),
  );
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  };
}
