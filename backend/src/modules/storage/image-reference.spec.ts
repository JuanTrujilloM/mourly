import { isExternalImage } from './image-reference';

describe('isExternalImage', () => {
  it.each(['https://randomuser.me/a.jpg', 'http://cdn/a.jpg', 'HTTPS://x/a'])(
    'treats %s as an external url',
    (reference) => {
      expect(isExternalImage(reference)).toBe(true);
    },
  );

  it('treats a bucket key as internal', () => {
    expect(isExternalImage('profiles/a.jpg')).toBe(false);
  });
});
