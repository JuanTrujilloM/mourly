import { BadRequestException } from '@nestjs/common';
import {
  assertAnswerIsCoherent,
  assertDateAlreadyHappened,
} from './feedback-rules';

const NOW = new Date('2026-07-02T20:00:00Z');

describe('assertDateAlreadyHappened', () => {
  it('accepts a date in the past', () => {
    expect(() =>
      assertDateAlreadyHappened(new Date('2026-07-01T20:00:00Z'), NOW),
    ).not.toThrow();
  });

  it('accepts a date happening exactly now', () => {
    expect(() => assertDateAlreadyHappened(NOW, NOW)).not.toThrow();
  });

  it('rejects a date still in the future', () => {
    expect(() =>
      assertDateAlreadyHappened(new Date('2026-07-03T20:00:00Z'), NOW),
    ).toThrow(BadRequestException);
  });
});

describe('assertAnswerIsCoherent', () => {
  it('accepts an attended date with a rating', () => {
    expect(() =>
      assertAnswerIsCoherent({ occurred: true, rating: 4 }),
    ).not.toThrow();
  });

  it('requires a rating when the date happened', () => {
    expect(() => assertAnswerIsCoherent({ occurred: true })).toThrow(
      /Rate the date/,
    );
  });

  it('accepts a no-show without a rating', () => {
    expect(() => assertAnswerIsCoherent({ occurred: false })).not.toThrow();
  });

  it('rejects rating a date that never happened', () => {
    expect(() =>
      assertAnswerIsCoherent({ occurred: false, rating: 5 }),
    ).toThrow(/cannot be rated/);
  });
});
