'use client';

import { useLogout } from '@/hooks/useLogout';
import { Button } from '@/components/ui/Button';

export function LogoutButton({ className = '' }: { className?: string }) {
  const { mutate, isPending } = useLogout();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => mutate()}
      disabled={isPending}
    >
      {isPending ? 'Saliendo...' : 'Salir'}
    </Button>
  );
}
