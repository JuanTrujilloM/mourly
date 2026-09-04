import { ageFrom } from './age';

describe('ageFrom', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('counts full years for a birthday already passed this year', () => {
    expect(ageFrom(new Date('2000-01-10'))).toBe(26);
  });

  it('subtracts a year when the birth month is still ahead', () => {
    expect(ageFrom(new Date('2000-12-10'))).toBe(25);
  });

  it('subtracts a year when the birthday falls later this month', () => {
    expect(ageFrom(new Date('2000-06-20'))).toBe(25);
  });

  it('counts the year on the exact birthday', () => {
    expect(ageFrom(new Date('2000-06-15'))).toBe(26);
  });
});
