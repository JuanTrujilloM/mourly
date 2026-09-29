import { matchesImageSignature } from './image-signature';

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

describe('matchesImageSignature', () => {
  it('accepts a real jpeg', () => {
    expect(matchesImageSignature('image/jpeg', JPEG)).toBe(true);
  });

  it('accepts a real png', () => {
    expect(matchesImageSignature('image/png', PNG)).toBe(true);
  });

  it('rejects content that does not match the declared type', () => {
    expect(matchesImageSignature('image/png', JPEG)).toBe(false);
    expect(matchesImageSignature('image/jpeg', Buffer.from('<html>'))).toBe(
      false,
    );
  });

  it('rejects content shorter than the signature', () => {
    expect(matchesImageSignature('image/png', Buffer.from([0x89]))).toBe(false);
  });

  it('rejects a mime type without a known signature', () => {
    expect(matchesImageSignature('image/webp', JPEG)).toBe(false);
  });
});
