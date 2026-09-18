import { CONTACT_EMAIL } from '../mail.constants';
import { verificationCodeEmail } from './verification-code.template';

const email = verificationCodeEmail({ code: '482913', ttlMinutes: 10 });

describe('verificationCodeEmail', () => {
  it('leads the subject with the code', () => {
    expect(email.subject.startsWith('482913')).toBe(true);
  });

  it('writes the subject in Spanish', () => {
    expect(email.subject).toContain('código');
  });

  it('puts the code and the expiry in the html', () => {
    expect(email.html).toContain('482913');
    expect(email.html).toContain('10 minutos');
  });

  it('puts the code and the expiry in the plain text', () => {
    expect(email.text).toContain('482913');
    expect(email.text).toContain('10 minutos');
  });

  it('contains no links anywhere', () => {
    const everything = `${email.subject}${email.html}${email.text}`;

    expect(everything).not.toMatch(/<a\s/i);
    expect(everything).not.toMatch(/https?:\/\//i);
  });

  it('signs both parts with the contact address', () => {
    expect(email.html).toContain(CONTACT_EMAIL);
    expect(email.text).toContain(CONTACT_EMAIL);
  });
});
