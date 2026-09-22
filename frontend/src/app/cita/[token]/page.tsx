'use client';

import { useParams } from 'next/navigation';
import { FlowLoading } from '@/components/availability/FlowGuards';
import { FlowState } from '@/components/availability/FlowState';
import { DateStation } from '@/components/cita/DateStation';
import { PhoneShell } from '@/components/shared/PhoneShell';
import { ButtonLink } from '@/components/ui/Button';
import { useDateView } from '@/hooks/useDateView';

export default function DatePage() {
  const { token } = useParams<{ token: string }>();
  // The shell's scroller has no bottom padding (see PhoneShell); the page adds its own.
  return (
    <PhoneShell>
      <div className="pb-10">
        <DateContent token={token} />
      </div>
    </PhoneShell>
  );
}

function DateContent({ token }: { token: string }) {
  const { data, isLoading, isError } = useDateView(token);

  if (isLoading) return <FlowLoading label="Cargando tu cita..." />;
  if (isError || !data) return <DateLinkError />;

  return <DateStation view={data} />;
}

// The link dies a day after the date (or with the date, if it was called off).
function DateLinkError() {
  return (
    <FlowState
      title="Este enlace ya no sirve"
      description="Venció o la cita ya pasó. Lo que siga de tu cita está en la app."
    >
      <div className="mt-6">
        <ButtonLink href="/dashboard">Abrir Mourly</ButtonLink>
      </div>
    </FlowState>
  );
}
