export const SCHEDULED_JOBS = {
  weeklyMatching: 'weekly-matching',
  matchRecycling: 'match-recycling',
  responseTimeout: 'response-timeout',
  feedbackWindow: 'feedback-window',
  unverifiedAccountCleanup: 'unverified-account-cleanup',
} as const;

export type ScheduledJobName =
  (typeof SCHEDULED_JOBS)[keyof typeof SCHEDULED_JOBS];
