import { toPartnerSummary } from './partner.mapper';

const PROFILE = {
  name: 'Beto',
  dateOfBirth: new Date('2002-01-01'),
  university: 'CES',
  major: 'Medicina',
  biography: 'Corro maratones',
};

const PHOTO_URL = 'https://signed/b.jpg';

describe('toPartnerSummary', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null when the user has no profile', () => {
    expect(toPartnerSummary({ profile: null }, PHOTO_URL)).toBeNull();
  });

  it('returns null when there is no user at all', () => {
    expect(toPartnerSummary(null, PHOTO_URL)).toBeNull();
  });

  it('carries the photo url it was given', () => {
    expect(toPartnerSummary({ profile: PROFILE }, PHOTO_URL)?.photoUrl).toBe(
      PHOTO_URL,
    );
  });

  it('reports null when there is no photo', () => {
    expect(toPartnerSummary({ profile: PROFILE }, null)?.photoUrl).toBeNull();
  });

  it('derives the age from the birth date', () => {
    expect(toPartnerSummary({ profile: PROFILE }, null)?.age).toBe(24);
  });

  it('never exposes the birth date itself', () => {
    const summary = toPartnerSummary({ profile: PROFILE }, null);

    expect(summary).not.toHaveProperty('dateOfBirth');
  });
});
