'use client';

import type { CalendarDay } from '@/types/availability';
import { formatSlot, within } from './drag';
import { useSlotDrag } from './useSlotDrag';
import { CalendarHeader } from './CalendarHeader';

export function AvailabilityCalendar({
  days,
  timeSlots,
  selected,
  onToggle,
}: {
  days: CalendarDay[];
  timeSlots: string[];
  selected: Set<string>;
  onToggle: (date: string, timeSlot: string) => void;
}) {
  const { drag, keyOf, startDrag, toggleColumn } = useSlotDrag({
    days,
    timeSlots,
    selected,
    onToggle,
  });

  return (
    <div className="select-none">
      <div
        className="bg-navy-soft/40 grid touch-none overflow-hidden rounded-2xl border border-white/10"
        style={{
          gridTemplateColumns: `2.75rem repeat(${days.length}, minmax(0, 1fr))`,
        }}
      >
        <CalendarHeader
          days={days}
          isColumnFull={(col) =>
            timeSlots.every((_, row) => selected.has(keyOf(row, col)))
          }
          onToggleColumn={toggleColumn}
        />

        {timeSlots.map((slot, row) => (
          <div key={slot} className="contents">
            <div className="text-slate flex items-center justify-end pr-2 text-[11px] leading-tight">
              {formatSlot(slot)}
            </div>
            {days.map((day, col) => {
              const inDrag = drag ? within(drag, row, col) : false;
              const isSelected = inDrag
                ? drag!.mode === 'add'
                : selected.has(keyOf(row, col));
              return (
                <div
                  key={day.date}
                  data-cell
                  data-row={row}
                  data-col={col}
                  role="button"
                  aria-pressed={selected.has(keyOf(row, col))}
                  aria-label={`${day.label} ${formatSlot(slot)}`}
                  tabIndex={0}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    startDrag(row, col);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onToggle(day.date, slot);
                    }
                  }}
                  className={`h-11 cursor-pointer border-l border-white/10 transition-colors ${
                    row === 0 ? '' : 'border-t'
                  } ${isSelected ? 'bg-cyan/70' : 'bg-transparent hover:bg-white/5'} ${
                    inDrag ? 'ring-cyan/60 ring-1 ring-inset' : ''
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <p className="text-slate mt-3 text-center text-xs">
        Arrastra para marcar varias horas. Toca un día para seleccionarlo entero.
      </p>
    </div>
  );
}
