import { buildPartnerSummary } from './partner-summary';

const PROFILE = {
  name: 'Beto',
  dateOfBirth: new Date('2002-01-01'),
  university: 'CES',
  major: 'Medicina',
  photos: [
    { url: 'https://cdn/a.jpg', isPrimary: false },
    { url: 'https://cdn/b.jpg', isPrimary: true },
  ],
};

describe('buildPartnerSummary', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('falls back to a placeholder when there is no profile', () => {
    expect(buildPartnerSummary(null)).toEqual({
      name: 'tu match',
      age: null,
      university: null,
      major: null,
      photoUrl: null,
    });
  });

  it('prefers the primary photo', () => {
    expect(buildPartnerSummary(PROFILE).photoUrl).toBe('https://cdn/b.jpg');
  });

  it('falls back to the first photo when none is primary', () => {
    const photos = [{ url: 'https://cdn/a.jpg', isPrimary: false }];

    expect(buildPartnerSummary({ ...PROFILE, photos }).photoUrl).toBe(
      'https://cdn/a.jpg',
    );
  });

  it('reports a null photo when there are none', () => {
    expect(buildPartnerSummary({ ...PROFILE, photos: [] }).photoUrl).toBeNull();
  });

  it('derives the age in UTC so the server timezone cannot shift it', () => {
    expect(buildPartnerSummary(PROFILE).age).toBe(24);
  });
});
