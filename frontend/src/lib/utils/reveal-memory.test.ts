import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { rememberReveal, shouldPlayReveal } from './reveal-memory';

// The test environment has no localStorage; each test gets its own.
function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => {
      data.delete(key);
    },
    setItem: (key, value) => {
      data.set(key, String(value));
    },
  };
}

describe('reveal memory', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('plays the first time a link is opened', () => {
    expect(shouldPlayReveal('tok')).toBe(true);
  });

  it('does not play again for the same link', () => {
    rememberReveal('tok');

    expect(shouldPlayReveal('tok')).toBe(false);
    expect(shouldPlayReveal('other')).toBe(true);
  });

  it('does not play when the phone asks for reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));

    expect(shouldPlayReveal('tok')).toBe(false);
  });

  it('does not play when storage is blocked', () => {
    vi.stubGlobal('localStorage', {
      ...memoryStorage(),
      getItem: () => {
        throw new Error('blocked');
      },
    });

    expect(shouldPlayReveal('tok')).toBe(false);
  });
});
