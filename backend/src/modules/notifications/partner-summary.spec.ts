import { buildPartnerSummary } from './partner-summary';

const PROFILE = {
  name: 'Beto',
  dateOfBirth: new Date('2002-01-01'),
  university: 'CES',
  major: 'Medicina',
};

const PHOTO_URL = 'https://signed/b.jpg';

describe('buildPartnerSummary', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('falls back to a placeholder when there is no profile', () => {
    expect(buildPartnerSummary(null, PHOTO_URL)).toEqual({
      name: 'tu match',
      age: null,
      university: null,
      major: null,
      photoUrl: null,
    });
  });

  it('carries the photo url it was given', () => {
    expect(buildPartnerSummary(PROFILE, PHOTO_URL).photoUrl).toBe(PHOTO_URL);
  });

  it('reports a null photo when there is none', () => {
    expect(buildPartnerSummary(PROFILE, null).photoUrl).toBeNull();
  });

  it('derives the age in UTC so the server timezone cannot shift it', () => {
    expect(buildPartnerSummary(PROFILE, null).age).toBe(24);
  });
});
