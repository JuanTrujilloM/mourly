'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { nextRouteFor } from '@/lib/auth/next-route';
import type { AuthUser } from '@/types/auth';
import { CellphoneStep } from './CellphoneStep';
import { PhoneCodeStep } from './PhoneCodeStep';

export function PhoneVerificationForm({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [editing, setEditing] = useState(user.cellphone === null);

  useEffect(() => {
    if (user.cellphoneVerified) router.replace(nextRouteFor(user));
  }, [user, router]);

  if (user.cellphoneVerified) return null;

  if (editing || !user.cellphone) {
    return (
      <CellphoneStep
        current={user.cellphone}
        onSaved={() => setEditing(false)}
      />
    );
  }

  return (
    <PhoneCodeStep
      cellphone={user.cellphone}
      onChangeNumber={() => setEditing(true)}
    />
  );
}
