'use client';

import type { ReactNode } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { AuthUser } from '@/types/auth';

export function AuthGate({
  children,
}: {
  children: (user: AuthUser) => ReactNode;
}) {
  const { data: user, isLoading, isError } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <p className="text-ink-3 text-sm">Cargando tu sesión...</p>
      </div>
    );
  }

  if (isError || !user) return null;

  return <>{children(user)}</>;
}
