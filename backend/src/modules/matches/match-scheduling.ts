import { spanishUtcDayLabel } from '../../common/utils/spanish-date';
import { ACTIVE_MATCH_STATUSES } from '../chatbot/user-context/match-status';
import { MIN_VENUE_SELECTION } from './matches.constants';
import { COLOMBIA_UTC_OFFSET_HOURS } from './match-confirmation.constants';
import type { LoadedMatch } from './match-loader.service';

export type CommonSlot = { scheduledAt: Date; label: string };

type SlotRow = { userId: string; date: Date; timeSlot: string };

function slotKey(slot: { date: Date; timeSlot: string }): string {
  return `${slot.date.toISOString().slice(0, 10)}|${slot.timeSlot}`;
}

function slotInstant(slot: SlotRow): number {
  return Date.UTC(
    slot.date.getUTCFullYear(),
    slot.date.getUTCMonth(),
    slot.date.getUTCDate(),
    Number(slot.timeSlot.slice(0, 2)) + COLOMBIA_UTC_OFFSET_HOURS,
  );
}

export function bothCompleted(match: LoadedMatch): boolean {
  const hasAvailability = (userId: string) =>
    match.availabilities.some((slot) => slot.userId === userId);
  const selectedCount = (
    pick: (option: LoadedMatch['venueOptions'][number]) => boolean,
  ) => match.venueOptions.filter(pick).length;

  return (
    hasAvailability(match.userAId) &&
    hasAvailability(match.userBId) &&
    selectedCount((option) => option.userASelected) >= MIN_VENUE_SELECTION &&
    selectedCount((option) => option.userBSelected) >= MIN_VENUE_SELECTION
  );
}

export function earliestCommonSlot(match: LoadedMatch): CommonSlot | null {
  const userBKeys = new Set(
    match.availabilities
      .filter((slot) => slot.userId === match.userBId)
      .map(slotKey),
  );
  const shared = match.availabilities
    .filter(
      (slot) => slot.userId === match.userAId && userBKeys.has(slotKey(slot)),
    )
    .sort((a, b) => slotInstant(a) - slotInstant(b));

  const first = shared[0];
  if (!first) {
    return null;
  }
  return {
    scheduledAt: new Date(slotInstant(first)),
    label: `${spanishUtcDayLabel(first.date)} · ${first.timeSlot}`,
  };
}

export function commonVenueId(match: LoadedMatch): string | null {
  const shared = match.venueOptions.find(
    (option) => option.userASelected && option.userBSelected,
  );
  return shared?.venueId ?? null;
}

export function venueById(
  match: LoadedMatch,
  venueId: string,
): { name: string; address: string } {
  const option = match.venueOptions.find(
    (candidate) => candidate.venueId === venueId,
  );
  return {
    name: option?.venue.name ?? 'el lugar acordado',
    address: option?.venue.address ?? '',
  };
}

export function isActiveStatus(status: string): boolean {
  return (ACTIVE_MATCH_STATUSES as readonly string[]).includes(status);
}
