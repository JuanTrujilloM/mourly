'use client';

import { useCallback, useEffect, useState } from 'react';
import { RESEND_COOLDOWN_SECONDS } from '@/lib/constants/auth';
import {
  rememberResendCooldown,
  remainingResendCooldown,
} from '@/lib/utils/resend-cooldown';

// The countdown resumes from the deadline stored when the code was sent, so a
// reload does not restart it. Without storage the reader answers a full
// cooldown, which is also what a server render gets.
export function useResendCooldown(email: string) {
  const [cooldown, setCooldown] = useState(() =>
    remainingResendCooldown(email),
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const startCooldown = useCallback(
    (seconds = RESEND_COOLDOWN_SECONDS) => {
      rememberResendCooldown(email, seconds);
      setCooldown(seconds);
    },
    [email],
  );

  return { cooldown, startCooldown };
}
