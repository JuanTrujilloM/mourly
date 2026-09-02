'use client';

import type { ReactNode } from 'react';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';

export function GuestGate({ children }: { children: ReactNode }) {
  const { isLoading, isSuccess } = useRedirectIfAuthenticated();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <p className="text-slate animate-pulse text-sm">Cargando...</p>
      </div>
    );
  }

  if (isSuccess) return null;

  return <>{children}</>;
}
