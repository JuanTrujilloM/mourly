import { toPartnerSummary } from './partner.mapper';

const PROFILE = {
  name: 'Beto',
  dateOfBirth: new Date('2002-01-01'),
  university: 'CES',
  major: 'Medicina',
  biography: 'Corro maratones',
  photos: [
    { url: 'https://cdn/a.jpg', isPrimary: false },
    { url: 'https://cdn/b.jpg', isPrimary: true },
  ],
};

describe('toPartnerSummary', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null when the user has no profile', () => {
    expect(toPartnerSummary({ profile: null })).toBeNull();
  });

  it('returns null when there is no user at all', () => {
    expect(toPartnerSummary(null)).toBeNull();
  });

  it('prefers the primary photo', () => {
    expect(toPartnerSummary({ profile: PROFILE })?.photoUrl).toBe(
      'https://cdn/b.jpg',
    );
  });

  it('falls back to the first photo when none is primary', () => {
    const photos = [{ url: 'https://cdn/a.jpg', isPrimary: false }];

    expect(
      toPartnerSummary({ profile: { ...PROFILE, photos } })?.photoUrl,
    ).toBe('https://cdn/a.jpg');
  });

  it('reports null when there are no photos', () => {
    expect(
      toPartnerSummary({ profile: { ...PROFILE, photos: [] } })?.photoUrl,
    ).toBeNull();
  });

  it('derives the age from the birth date', () => {
    expect(toPartnerSummary({ profile: PROFILE })?.age).toBe(24);
  });

  it('never exposes the birth date itself', () => {
    const summary = toPartnerSummary({ profile: PROFILE });

    expect(summary).not.toHaveProperty('dateOfBirth');
  });
});
