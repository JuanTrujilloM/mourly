'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { nextRouteFor } from '@/lib/auth/next-route';

export function useRedirectIfAuthenticated() {
  const router = useRouter();
  const query = useCurrentUser();

  useEffect(() => {
    if (query.isSuccess && query.data) router.replace(nextRouteFor(query.data));
  }, [query.isSuccess, query.data, router]);

  return query;
}
