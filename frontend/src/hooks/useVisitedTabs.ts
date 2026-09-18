'use client';

import { useState } from 'react';

// Updating state during render (not in an effect) lets React re-render before
// commit, so a newly visited panel is already mounted when its slide starts.
export function useVisitedTabs(active: number): ReadonlySet<number> {
  const [visited, setVisited] = useState(() => new Set([active]));
  if (!visited.has(active)) setVisited(new Set(visited).add(active));
  return visited;
}
