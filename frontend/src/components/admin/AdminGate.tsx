'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Splash } from '@/components/shared/Splash';
import type { AuthUser } from '@/types/auth';

export function AdminGate({
  children,
}: {
  children: (user: AuthUser) => ReactNode;
}) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useRequireAuth();

  useEffect(() => {
    if (user && !user.isAdmin) router.replace('/dashboard');
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="noche">
        <Splash label="Cargando panel" />
      </div>
    );
  }

  if (isError || !user || !user.isAdmin) return null;

  return <>{children(user)}</>;
}
