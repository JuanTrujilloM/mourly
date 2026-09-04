'use client';

import type { AdminUser } from '@/types/admin';
import type { UserActions } from './userColumns';

export function UserRowActions({
  user,
  actions,
}: {
  user: AdminUser;
  actions: UserActions;
}) {
  return (
    <div className="flex justify-end gap-3">
      {user.profile ? (
        <button
          onClick={() =>
            actions.onStatusChange(
              user.id,
              user.profile!.status === 'SEARCHING' ? 'PAUSED' : 'SEARCHING',
            )
          }
          disabled={actions.isBusy}
          className="text-ink-2 hover:text-ink text-xs font-medium transition disabled:opacity-50"
        >
          {user.profile.status === 'SEARCHING' ? 'Pausar' : 'Reanudar'}
        </button>
      ) : null}
      {!user.isVerified ? (
        <button
          onClick={() => actions.onVerify(user.id)}
          disabled={actions.isBusy}
          className="text-ink text-xs font-medium underline underline-offset-2 transition disabled:opacity-50"
        >
          Verificar
        </button>
      ) : null}
    </div>
  );
}
