import { describe, expect, it } from 'vitest';
import { countdownParts, nextMatchMoment } from './next-match-moment';

// Colombia is UTC-5 all year: Thursday 19:00 in Medellín is Friday 00:00 UTC.
describe('nextMatchMoment', () => {
  it('points to this Thursday 7:00 pm when the week has not reached it', () => {
    const monday = new Date('2026-09-07T15:00:00Z');
    expect(nextMatchMoment(monday).toISOString()).toBe('2026-09-11T00:00:00.000Z');
  });

  it('keeps today when it is Thursday before 7:00 pm', () => {
    const thursday = new Date('2026-09-10T23:59:00Z');
    expect(nextMatchMoment(thursday).toISOString()).toBe('2026-09-11T00:00:00.000Z');
  });

  it('moves to next week at exactly Thursday 7:00 pm', () => {
    const moment = new Date('2026-09-11T00:00:00Z');
    expect(nextMatchMoment(moment).toISOString()).toBe('2026-09-18T00:00:00.000Z');
  });

  it('moves to next week on Friday', () => {
    const friday = new Date('2026-09-11T13:00:00Z');
    expect(nextMatchMoment(friday).toISOString()).toBe('2026-09-18T00:00:00.000Z');
  });
});

describe('countdownParts', () => {
  it('splits the remaining time into days, hours and whole minutes', () => {
    const now = new Date('2026-09-09T21:56:20Z');
    const target = new Date('2026-09-11T00:00:00Z');
    expect(countdownParts(now, target)).toEqual({ days: 1, hours: 2, minutes: 3 });
  });

  it('never goes below zero', () => {
    const now = new Date('2026-09-11T00:00:01Z');
    const target = new Date('2026-09-11T00:00:00Z');
    expect(countdownParts(now, target)).toEqual({ days: 0, hours: 0, minutes: 0 });
  });
});
