'use client';

import type { CalendarDay } from '@/types/availability';

export function CalendarHeader({
  days,
  isColumnFull,
  onToggleColumn,
}: {
  days: CalendarDay[];
  isColumnFull: (col: number) => boolean;
  onToggleColumn: (col: number) => void;
}) {
  return (
    <>
      <div className="border-line border-b" />
      {days.map((day, col) => {
        const [weekday, dayNumber] = day.label.split(' ');
        const allSelected = isColumnFull(col);

        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onToggleColumn(col)}
            className={`border-line flex flex-col items-center gap-0.5 border-b border-l py-1.5 text-center transition duration-(--dur-fast) ${
              allSelected ? 'bg-verde-100' : 'hover:bg-surface-2'
            }`}
          >
            <span className="text-ink-3 text-[10px] font-medium capitalize">
              {weekday}
            </span>
            <span className="text-ink text-sm font-semibold tabular-nums">
              {dayNumber}
            </span>
          </button>
        );
      })}
    </>
  );
}
