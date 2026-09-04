import { ConfigService } from '@nestjs/config';
import { ConversationCacheService } from './conversation-cache.service';

function setup(ttlSeconds?: string) {
  const config = {
    get: (key: string) =>
      key === 'CHATBOT_MEMORY_TTL_SECONDS' ? ttlSeconds : undefined,
  } as unknown as ConfigService;
  return new ConversationCacheService(config);
}

const TURNS = [
  { role: 'human' as const, content: 'hola' },
  { role: 'ai' as const, content: 'hola!' },
];

describe('ConversationCacheService', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('reports a cache miss as a new session', () => {
    expect(setup().get('u1')).toBeNull();
  });

  it('returns the stored turns', () => {
    const cache = setup();
    cache.set('u1', TURNS);

    expect(cache.get('u1')).toEqual(TURNS);
  });

  it('keeps conversations separate per user', () => {
    const cache = setup();
    cache.set('u1', TURNS);

    expect(cache.get('u2')).toBeNull();
  });

  it('caps the history to the most recent turns', () => {
    const cache = setup();
    const many = Array.from({ length: 20 }, (_, index) => ({
      role: 'human' as const,
      content: String(index),
    }));

    cache.set('u1', many);

    const stored = cache.get('u1');
    expect(stored).toHaveLength(12);
    expect(stored?.[11].content).toBe('19');
  });

  it('expires a conversation after the configured ttl', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-10T12:00:00Z'));
    const cache = setup('60');
    cache.set('u1', TURNS);

    jest.setSystemTime(new Date('2026-07-10T12:02:00Z'));

    expect(cache.get('u1')).toBeNull();
  });

  it('keeps a conversation alive inside the ttl', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-10T12:00:00Z'));
    const cache = setup('60');
    cache.set('u1', TURNS);

    jest.setSystemTime(new Date('2026-07-10T12:00:30Z'));

    expect(cache.get('u1')).toEqual(TURNS);
  });
});
