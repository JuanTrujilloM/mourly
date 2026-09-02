'use client';

import { useEffect, useState } from 'react';

const RESEND_COOLDOWN_SECONDS = 60;

export function useResendCooldown() {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  return {
    cooldown,
    startCooldown: () => setCooldown(RESEND_COOLDOWN_SECONDS),
  };
}
