import { IsAdultConstraint } from './is-adult.validator';

describe('IsAdultConstraint', () => {
  const constraint = new IsAdultConstraint();

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('accepts someone comfortably over the minimum age', () => {
    expect(constraint.validate('2000-01-01')).toBe(true);
  });

  it('accepts someone on their eighteenth birthday', () => {
    expect(constraint.validate('2008-06-15')).toBe(true);
  });

  it('rejects someone a day short of the minimum age', () => {
    expect(constraint.validate('2008-06-16')).toBe(false);
  });

  it('rejects a non-string value', () => {
    expect(constraint.validate(20080615)).toBe(false);
  });

  it('rejects an unparseable date', () => {
    expect(constraint.validate('not-a-date')).toBe(false);
  });

  it('states the minimum age in its message', () => {
    expect(constraint.defaultMessage()).toContain('18');
  });
});
