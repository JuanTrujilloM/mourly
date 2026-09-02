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
      <div className="border-b border-white/10" />
      {days.map((day, col) => {
        const [weekday, dayNumber] = day.label.split(' ');
        const allSelected = isColumnFull(col);

        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onToggleColumn(col)}
            className={`flex flex-col items-center gap-0.5 border-b border-l border-white/10 py-1.5 text-center transition ${
              allSelected ? 'bg-cyan/10' : 'hover:bg-white/5'
            }`}
          >
            <span className="text-slate text-[10px] font-medium capitalize">
              {weekday}
            </span>
            <span
              className={`text-sm font-semibold ${
                allSelected ? 'text-cyan' : 'text-cream'
              }`}
            >
              {dayNumber}
            </span>
          </button>
        );
      })}
    </>
  );
}
