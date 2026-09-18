'use client';

import type { ReactNode } from 'react';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';
import { SplashOverlay } from './Splash';

export function GuestGate({ children }: { children: ReactNode }) {
  const { isLoading, isSuccess } = useRedirectIfAuthenticated();
  const ready = !isLoading && !isSuccess;

  return (
    <>
      <SplashOverlay active={!ready} />
      {ready ? children : null}
    </>
  );
}
