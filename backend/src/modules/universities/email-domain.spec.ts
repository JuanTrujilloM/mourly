import { getEmailDomain } from './email-domain';

describe('getEmailDomain', () => {
  it('extracts the domain trimmed and lowercased', () => {
    expect(getEmailDomain('  Ana@EAFIT.edu.co ')).toBe('eafit.edu.co');
  });

  it('keeps the full domain, so a shorter look-alike cannot match', () => {
    expect(getEmailDomain('bobo@eafit.co')).toBe('eafit.co');
    expect(getEmailDomain('bobo@eafit.edu')).toBe('eafit.edu');
  });

  it('keeps anything appended after the real domain', () => {
    expect(getEmailDomain('bobo@eafit.edu.co.evil.com')).toBe(
      'eafit.edu.co.evil.com',
    );
    expect(getEmailDomain('bobo@eafit.edu.co.')).toBe('eafit.edu.co.');
  });

  it('keeps a prefixed host apart from the real domain', () => {
    expect(getEmailDomain('bobo@correo.eafit.edu.co')).toBe(
      'correo.eafit.edu.co',
    );
    expect(getEmailDomain('bobo@evil-eafit.edu.co')).toBe('evil-eafit.edu.co');
  });

  it('leaves a look-alike unicode character untranslated', () => {
    expect(getEmailDomain('bobo@eаfit.edu.co')).not.toBe('eafit.edu.co');
  });

  it('takes the host after the first at sign, never the last', () => {
    expect(getEmailDomain('bobo@evil.com@eafit.edu.co')).toBe('evil.com');
  });

  it('returns an empty string when there is no at sign', () => {
    expect(getEmailDomain('not-an-email')).toBe('');
  });

  it('returns an empty string for an empty input', () => {
    expect(getEmailDomain('')).toBe('');
  });
});
