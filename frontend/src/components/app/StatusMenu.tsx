'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LogoutButton } from '@/components/shared/LogoutButton';
import { Toggle } from '@/components/ui/Toggle';
import { useUpdateAvailability } from '@/hooks/useUpdateAvailability';
import {
  AVAILABILITY_STATUS,
  type AvailabilityStatus,
} from '@/lib/constants/profile';
import type { AuthUser } from '@/types/auth';

// Search state and session, compacted into one pill at the top right.
export function StatusMenu({
  user,
  status,
  isLoading,
}: {
  user: AuthUser;
  status: AvailabilityStatus;
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { mutate, isPending } = useUpdateAvailability();
  const searching = status === AVAILABILITY_STATUS.SEARCHING;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="border-line bg-surface text-ink hover:border-ink-2 inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[13px] font-semibold transition duration-(--dur-fast)"
      >
        <span
          aria-hidden
          className={`h-2 w-2 rounded-full ${searching ? 'bg-live' : 'bg-gris-400'}`}
        />
        {isLoading ? 'Cargando' : searching ? 'Buscando' : 'En pausa'}
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="group"
          aria-label="Búsqueda y sesión"
          className="border-line bg-surface rounded-input absolute top-full right-0 z-20 mt-2 w-64 border p-2"
        >
          <div className="flex items-center justify-between gap-3 px-2 py-2">
            <div>
              <p className="text-ink text-sm font-medium">Buscar cita</p>
              <p className="text-ink-3 text-xs">
                {searching
                  ? 'Entrás en la ronda del jueves.'
                  : 'En pausa hasta que vuelvas.'}
              </p>
            </div>
            <Toggle
              checked={searching}
              disabled={isPending || isLoading}
              hideLabel
              labelOn="Buscando cita"
              labelOff="Búsqueda en pausa"
              onChange={(next) =>
                mutate(
                  next
                    ? AVAILABILITY_STATUS.SEARCHING
                    : AVAILABILITY_STATUS.PAUSED,
                )
              }
            />
          </div>

          {user.isAdmin && (
            <Link
              href="/admin"
              className="text-ink-2 hover:bg-surface-2 hover:text-ink rounded-chip-inner block px-2 py-2 text-sm transition duration-(--dur-fast)"
            >
              Panel de administración
            </Link>
          )}

          <div className="border-line my-1 border-t" />
          <LogoutButton className="w-full justify-start px-2" />
        </div>
      )}
    </div>
  );
}
