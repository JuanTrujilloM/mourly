const KEY_PREFIX = 'mourly:reveal:';

// The reveal plays once per link. Without storage it never plays: opening the
// link again must show the profile straight away, not the animation again.
export function shouldPlayReveal(token: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      return false;
    }
    return window.localStorage.getItem(KEY_PREFIX + token) === null;
  } catch {
    return false;
  }
}

export function rememberReveal(token: string): void {
  try {
    window.localStorage.setItem(KEY_PREFIX + token, '1');
  } catch {
    // Storage is off: shouldPlayReveal already answers false then.
  }
}
