import { CONTACT_EMAIL, CONTACT_LOCATION } from '../mail.constants';
import {
  ctaButton,
  emailFooterText,
  emailLayout,
  escapeHtml,
} from './email-layout';

describe('escapeHtml', () => {
  it('escapes the five html-sensitive characters', () => {
    expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;',
    );
  });
});

describe('emailLayout', () => {
  const html = emailLayout('<p>Hola</p>');

  it('wraps the body', () => {
    expect(html).toContain('<p>Hola</p>');
  });

  it('signs the footer with the real identity', () => {
    expect(html).toContain(CONTACT_EMAIL);
    expect(html).toContain(CONTACT_LOCATION);
  });

  it('tells the reader why the email arrived', () => {
    expect(html).toContain('Recibís este correo porque');
  });

  it('adds no links of its own', () => {
    expect(html).not.toMatch(/<a\s/i);
  });
});

describe('emailFooterText', () => {
  it('carries the same identity and reason as the html footer', () => {
    const text = emailFooterText();

    expect(text).toContain(`Mourly · ${CONTACT_LOCATION} · ${CONTACT_EMAIL}`);
    expect(text).toContain('Recibís este correo porque');
  });
});

describe('ctaButton', () => {
  it('links both the button and the fallback line to the url', () => {
    const html = ctaButton('Entrar', 'https://mourly.com/x');

    expect(html.match(/href="https:\/\/mourly\.com\/x"/g)).toHaveLength(2);
    expect(html).toContain('Entrar');
  });
});
