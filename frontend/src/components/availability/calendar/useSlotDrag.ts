'use client';

import { useState } from 'react';
import type { CalendarDay } from '@/types/availability';
import { bounds, type Drag } from './drag';

export function useSlotDrag({
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
  const [drag, setDrag] = useState<Drag | null>(null);

  const keyOf = (row: number, col: number) =>
    `${days[col].date}|${timeSlots[row]}`;

  const commit = (final: Drag) => {
    const wantSelected = final.mode === 'add';
    const { r0, r1, c0, c1 } = bounds(final);
    for (let row = r0; row <= r1; row++) {
      for (let col = c0; col <= c1; col++) {
        if (selected.has(keyOf(row, col)) !== wantSelected) {
          onToggle(days[col].date, timeSlots[row]);
        }
      }
    }
  };

  const startDrag = (row: number, col: number) => {
    const mode: Drag['mode'] = selected.has(keyOf(row, col)) ? 'remove' : 'add';
    let latest: Drag = { startRow: row, startCol: col, curRow: row, curCol: col, mode };
    setDrag(latest);

    const onMove = (event: PointerEvent) => {
      const target = document.elementFromPoint(
        event.clientX,
        event.clientY,
      ) as HTMLElement | null;
      const cell = target?.closest<HTMLElement>('[data-cell]');
      if (!cell) return;
      const r = Number(cell.dataset.row);
      const c = Number(cell.dataset.col);
      if (latest.curRow === r && latest.curCol === c) return;
      latest = { ...latest, curRow: r, curCol: c };
      setDrag(latest);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      commit(latest);
      setDrag(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const toggleColumn = (col: number) => {
    const allSelected = timeSlots.every((_, row) =>
      selected.has(keyOf(row, col)),
    );
    timeSlots.forEach((_, row) => {
      if (selected.has(keyOf(row, col)) === allSelected) {
        onToggle(days[col].date, timeSlots[row]);
      }
    });
  };

  return { drag, keyOf, startDrag, toggleColumn };
}
