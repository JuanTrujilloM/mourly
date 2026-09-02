import { describe, expect, it } from 'vitest';
import { bounds, formatSlot, within, type Drag } from './drag';

function drag(
  startRow: number,
  startCol: number,
  curRow: number,
  curCol: number,
): Drag {
  return { startRow, startCol, curRow, curCol, mode: 'add' };
}

describe('bounds', () => {
  it('orders a forward drag', () => {
    expect(bounds(drag(1, 2, 3, 4))).toEqual({ r0: 1, r1: 3, c0: 2, c1: 4 });
  });

  it('normalizes a backward drag', () => {
    expect(bounds(drag(3, 4, 1, 2))).toEqual({ r0: 1, r1: 3, c0: 2, c1: 4 });
  });

  it('handles a single cell', () => {
    expect(bounds(drag(2, 2, 2, 2))).toEqual({ r0: 2, r1: 2, c0: 2, c1: 2 });
  });
});

describe('within', () => {
  it('includes a cell inside the rectangle', () => {
    expect(within(drag(0, 0, 2, 2), 1, 1)).toBe(true);
  });

  it('includes the corners', () => {
    expect(within(drag(0, 0, 2, 2), 0, 0)).toBe(true);
    expect(within(drag(0, 0, 2, 2), 2, 2)).toBe(true);
  });

  it('excludes a cell outside the rows', () => {
    expect(within(drag(0, 0, 2, 2), 3, 1)).toBe(false);
  });

  it('excludes a cell outside the columns', () => {
    expect(within(drag(0, 0, 2, 2), 1, 3)).toBe(false);
  });
});

describe('formatSlot', () => {
  it('shortens a full hour label', () => {
    expect(formatSlot('12:00')).toBeTruthy();
  });
});
