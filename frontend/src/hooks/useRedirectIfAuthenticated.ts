'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function useRedirectIfAuthenticated() {
  const router = useRouter();
  const query = useCurrentUser();

  useEffect(() => {
    if (query.isSuccess) {
      router.replace('/dashboard');
    }
  }, [query.isSuccess, router]);

  return query;
}
