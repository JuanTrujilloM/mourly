export const CALENDAR_DAYS = 7;

export const TIME_SLOTS = [
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

export const MIN_SLOTS = 1;
export const MAX_SLOTS = CALENDAR_DAYS * TIME_SLOTS.length;
