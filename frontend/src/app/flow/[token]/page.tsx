'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PhoneShell } from '@/components/shared/PhoneShell';
import {
  FlowLinkError,
  FlowLoading,
  FlowStepCompleted,
} from '@/components/availability/FlowGuards';
import { FlowProfile } from '@/components/flow-profile/FlowProfile';
import { useFlowProfile } from '@/hooks/useAvailabilityFlow';
import { rememberReveal, shouldPlayReveal } from '@/lib/utils/reveal-memory';

// Entry of the match link: the partner's profile, then places, then hours.
export default function FlowProfilePage() {
  const { token } = useParams<{ token: string }>();
  return (
    <PhoneShell>
      <ProfileContent token={token} />
    </PhoneShell>
  );
}

function ProfileContent({ token }: { token: string }) {
  const { data, isLoading, isError } = useFlowProfile(token);
  // Decided once, on the first client render: only the first open of this
  // link plays the reveal, and never with reduced motion.
  const [reveal] = useState(() => shouldPlayReveal(token));
  const open = Boolean(data && data.step !== 'COMPLETED');

  useEffect(() => {
    if (open) rememberReveal(token);
  }, [open, token]);

  if (isLoading) return <FlowLoading label="Buscando a tu match de la semana..." />;
  if (isError) return <FlowLinkError />;
  if (!data || data.step === 'COMPLETED') return <FlowStepCompleted />;
  return <FlowProfile token={token} view={data} reveal={reveal} />;
}
