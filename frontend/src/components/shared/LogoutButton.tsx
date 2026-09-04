'use client';

import { useLogout } from '@/hooks/useLogout';
import { Button } from '@/components/ui/Button';

export function LogoutButton() {
  const { mutate, isPending } = useLogout();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => mutate()}
      disabled={isPending}
    >
      {isPending ? 'Saliendo...' : 'Salir'}
    </Button>
  );
}
