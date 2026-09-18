'use client';

import type { ReactNode } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { AuthUser } from '@/types/auth';
import { SplashOverlay } from './Splash';

export function AuthGate({
  children,
}: {
  children: (user: AuthUser) => ReactNode;
}) {
  const { data: user, isLoading, isError, needsCellphone } = useRequireAuth();
  const ready = !isLoading && !isError && !!user && !needsCellphone;

  return (
    <>
      <SplashOverlay active={!ready} label="Cargando tu sesión" />
      {ready && user ? children(user) : null}
    </>
  );
}
