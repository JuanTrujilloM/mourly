'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { CELLPHONE_ROUTE, LOGIN_ROUTE } from '@/lib/auth/next-route';

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const query = useCurrentUser();
  const needsCellphone =
    !!query.data &&
    !query.data.cellphoneVerified &&
    pathname !== CELLPHONE_ROUTE;

  useEffect(() => {
    if (query.isError) router.replace(LOGIN_ROUTE);
  }, [query.isError, router]);

  useEffect(() => {
    if (needsCellphone) router.replace(CELLPHONE_ROUTE);
  }, [needsCellphone, router]);

  return { ...query, needsCellphone };
}
