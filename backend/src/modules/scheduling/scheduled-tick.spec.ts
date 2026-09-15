import { retentionCutoff, scheduledTick } from './scheduled-tick';

describe('scheduledTick', () => {
  it('truncates to the start of the minute', () => {
    expect(scheduledTick(new Date('2026-09-14T19:00:42.918Z'))).toEqual(
      new Date('2026-09-14T19:00:00.000Z'),
    );
  });

  it('gives two instances firing in the same minute the same tick', () => {
    expect(scheduledTick(new Date('2026-09-14T19:00:00.050Z'))).toEqual(
      scheduledTick(new Date('2026-09-14T19:00:59.990Z')),
    );
  });
});

describe('retentionCutoff', () => {
  it('keeps thirty days of runs', () => {
    expect(retentionCutoff(new Date('2026-09-14T00:00:00.000Z'))).toEqual(
      new Date('2026-08-15T00:00:00.000Z'),
    );
  });
});
