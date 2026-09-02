import type { VenueSuggestion } from './venue';

export interface CalendarDay {
  date: string;
  label: string;
}

export interface SlotSelection {
  date: string;
  timeSlot: string;
}

export type AvailabilityView =
  | {
      step: 'AVAILABILITY';
      partnerName: string | null;
      days: CalendarDay[];
      timeSlots: string[];
    }
  | { step: 'VENUE' }
  | { step: 'COMPLETED' };

export type TokenVenuesView =
  | {
      step: 'VENUE';
      partnerName: string | null;
      minSelection: number;
      venues: VenueSuggestion[];
    }
  | { step: 'AVAILABILITY' }
  | { step: 'COMPLETED' };
