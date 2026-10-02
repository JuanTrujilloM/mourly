import { SignedUrlCache } from './signed-url-cache';

describe('SignedUrlCache', () => {
  it('signs a key once per expiry', async () => {
    const cache = new SignedUrlCache();
    const sign = jest.fn().mockResolvedValue('https://signed/a');

    await cache.resolve('a', 100, sign);
    const url = await cache.resolve('a', 100, sign);

    expect(url).toBe('https://signed/a');
    expect(sign).toHaveBeenCalledTimes(1);
    expect(sign).toHaveBeenCalledWith('a', 100);
  });

  it('keeps keys apart', async () => {
    const cache = new SignedUrlCache();
    const sign = jest.fn((key: string) => Promise.resolve(`https://${key}`));

    expect(await cache.resolve('a', 100, sign)).toBe('https://a');
    expect(await cache.resolve('b', 100, sign)).toBe('https://b');
  });

  it('drops every cached url when the expiry changes', async () => {
    const cache = new SignedUrlCache();
    const sign = jest
      .fn()
      .mockResolvedValueOnce('https://old')
      .mockResolvedValueOnce('https://new');

    await cache.resolve('a', 100, sign);

    expect(await cache.resolve('a', 200, sign)).toBe('https://new');
    expect(sign).toHaveBeenLastCalledWith('a', 200);
  });
});
