import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// False on the server and while hydrating, true right after. Lets a statically
// rendered page show what only the browser knows (the clock) without a
// hydration mismatch.
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
