export type Drag = {
  startRow: number;
  startCol: number;
  curRow: number;
  curCol: number;
  mode: 'add' | 'remove';
};

export function bounds(drag: Drag) {
  return {
    r0: Math.min(drag.startRow, drag.curRow),
    r1: Math.max(drag.startRow, drag.curRow),
    c0: Math.min(drag.startCol, drag.curCol),
    c1: Math.max(drag.startCol, drag.curCol),
  };
}

export function within(drag: Drag, row: number, col: number): boolean {
  const { r0, r1, c0, c1 } = bounds(drag);
  return row >= r0 && row <= r1 && col >= c0 && col <= c1;
}

export function formatSlot(slot: string): string {
  const hour = Number(slot.slice(0, 2));
  const hour12 = hour > 12 ? hour - 12 : hour;
  return `${hour12} pm`;
}
