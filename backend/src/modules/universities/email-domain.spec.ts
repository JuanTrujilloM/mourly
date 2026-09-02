import { getEmailDomain } from './email-domain';

describe('getEmailDomain', () => {
  it('extracts the domain trimmed and lowercased', () => {
    expect(getEmailDomain('  Ana@EAFIT.edu.co ')).toBe('eafit.edu.co');
  });

  it('returns an empty string when there is no at sign', () => {
    expect(getEmailDomain('not-an-email')).toBe('');
  });

  it('returns an empty string for an empty input', () => {
    expect(getEmailDomain('')).toBe('');
  });
});
