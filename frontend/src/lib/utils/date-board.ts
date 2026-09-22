// Mirror of the backend's COLOMBIA_UTC_OFFSET_HOURS: Colombia has no daylight
// saving, so wall time is UTC-5 all year and needs no time-zone library.
const COLOMBIA_UTC_OFFSET_HOURS = 5;

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sept',
  'oct',
  'nov',
  'dic',
];

export interface DateBoard {
  day: string;
  time: string;
}

// "mar 22 sept" and "12:00 p. m." in Colombia time, whatever the phone's zone.
export function dateBoardFor(scheduledAt: string): DateBoard {
  const local = new Date(
    new Date(scheduledAt).getTime() - COLOMBIA_UTC_OFFSET_HOURS * 3_600_000,
  );
  const hours = local.getUTCHours();
  const minutes = String(local.getUTCMinutes()).padStart(2, '0');

  return {
    day: `${WEEKDAYS[local.getUTCDay()]} ${local.getUTCDate()} ${MONTHS[local.getUTCMonth()]}`,
    time: `${hours % 12 || 12}:${minutes} ${hours < 12 ? 'a. m.' : 'p. m.'}`,
  };
}
