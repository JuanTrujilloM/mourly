export const DAY = 24 * 60 * 60 * 1000;

export const daysFromNow = (n: number): Date => new Date(Date.now() + n * DAY);

export const daysAgo = (n: number): Date => new Date(Date.now() - n * DAY);

export const portrait = (folder: 'men' | 'women', n: number): string =>
  `https://randomuser.me/api/portraits/${folder}/${n}.jpg`;
