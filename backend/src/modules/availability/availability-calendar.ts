import { spanishDayLabel } from '../../common/utils/spanish-date';
import { CALENDAR_DAYS } from './availability.constants';

export type CalendarDay = { date: string; label: string };

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateAtUtcMidnight(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function calendarDates(anchor: Date): Date[] {
  const start = new Date(anchor);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 1);

  return Array.from({ length: CALENDAR_DAYS }, (_, offset) => {
    const day = new Date(start);
    day.setDate(start.getDate() + offset);
    return day;
  });
}

export function calendarDateKeys(anchor: Date): string[] {
  return calendarDates(anchor).map(dateKey);
}

export function buildCalendarDays(anchor: Date): CalendarDay[] {
  return calendarDates(anchor).map((date) => ({
    date: dateKey(date),
    label: spanishDayLabel(date),
  }));
}
