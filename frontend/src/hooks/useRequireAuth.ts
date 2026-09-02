'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function useRequireAuth() {
  const router = useRouter();
  const query = useCurrentUser();

  useEffect(() => {
    if (query.isError) {
      router.replace('/register');
    }
  }, [query.isError, router]);

  return query;
}
