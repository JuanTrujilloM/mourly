export type UrlSigner = (key: string, expiresAt: number) => Promise<string>;

export class SignedUrlCache {
  private readonly urls = new Map<string, string>();
  private expiresAt = 0;

  async resolve(
    key: string,
    expiresAt: number,
    sign: UrlSigner,
  ): Promise<string> {
    if (expiresAt !== this.expiresAt) {
      this.urls.clear();
      this.expiresAt = expiresAt;
    }
    const cached = this.urls.get(key);
    if (cached) {
      return cached;
    }
    const url = await sign(key, expiresAt);
    this.urls.set(key, url);
    return url;
  }
}
