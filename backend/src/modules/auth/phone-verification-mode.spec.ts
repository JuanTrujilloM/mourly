import { smsVerificationEnabled } from './phone-verification-mode';

describe('smsVerificationEnabled', () => {
  it.each([undefined, '', 'true', 'yes'])(
    'keeps SMS verification on for %p',
    (value) => {
      expect(smsVerificationEnabled(value)).toBe(true);
    },
  );

  it.each(['false', ' false '])('turns it off only for %p', (value) => {
    expect(smsVerificationEnabled(value)).toBe(false);
  });
});
