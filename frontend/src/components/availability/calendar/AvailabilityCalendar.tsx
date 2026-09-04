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
        className="bg-surface border-line rounded-card grid touch-none overflow-hidden border"
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
            <div className="text-ink-3 flex items-center justify-end pr-2 text-[11px] leading-tight tabular-nums">
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
                  className={`border-line h-11 cursor-pointer border-l transition-colors duration-(--dur-fast) ${
                    row === 0 ? '' : 'border-t'
                  } ${isSelected ? 'bg-verde-100' : 'hover:bg-surface-2 bg-transparent'} ${
                    inDrag ? 'ring-ink ring-1 ring-inset' : ''
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <p className="text-ink-3 mt-3 text-center text-xs">
        Arrastrá para marcar varias horas. Tocá un día para seleccionarlo entero.
      </p>
    </div>
  );
}
