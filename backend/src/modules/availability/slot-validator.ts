import { BadRequestException } from '@nestjs/common';
import { calendarDateKeys, dateAtUtcMidnight } from './availability-calendar';
import { TIME_SLOTS } from './availability.constants';
import { SlotSelectionDto } from './dto/submit-availability.dto';

export type AvailabilityRow = {
  matchId: string;
  userId: string;
  date: Date;
  timeSlot: string;
};

type SlotOwner = { matchId: string; userId: string };

export function validateSlots(
  slots: SlotSelectionDto[],
  anchor: Date,
  owner: SlotOwner,
): AvailabilityRow[] {
  const allowedDates = new Set(calendarDateKeys(anchor));
  const allowedTimeSlots = new Set<string>(TIME_SLOTS);
  const seen = new Set<string>();

  return slots.map((slot) => {
    const key = slot.date.slice(0, 10);
    if (!allowedDates.has(key)) {
      throw new BadRequestException('Alguna fecha está fuera del rango.');
    }
    if (!allowedTimeSlots.has(slot.timeSlot)) {
      throw new BadRequestException('Algún horario no es válido.');
    }

    const combination = `${key}|${slot.timeSlot}`;
    if (seen.has(combination)) {
      throw new BadRequestException('Hay horarios duplicados.');
    }
    seen.add(combination);

    return {
      matchId: owner.matchId,
      userId: owner.userId,
      date: dateAtUtcMidnight(key),
      timeSlot: slot.timeSlot,
    };
  });
}
