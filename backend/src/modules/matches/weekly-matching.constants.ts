export const WEEKLY_MATCHING_CRON = '0 19 * * 4';
export const WEEKLY_MATCHING_TIMEZONE = 'America/Bogota';

export const GENERATED_MATCH_STATUS = 'pending';
export const SEARCHING_PROFILE_STATUS = 'SEARCHING';

export const SCORE_WEIGHTS = {
  sharedHobbies: 5,
  relationshipType: 3,
  sameMajor: 1,
  semesterProximity: 1,
  biography: 2,
  height: 1,
  vibe: 2,
  feedback: 1,
} as const;

export const MAX_SCORED_SHARED_HOBBIES = 4;
export const SIMILAR_HEIGHT_CM = 5;
