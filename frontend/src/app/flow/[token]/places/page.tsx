'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PhoneShell } from '@/components/shared/PhoneShell';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/Button';
import { VenueCard } from '@/components/places/VenueCard';
import {
  FlowLinkError,
  FlowLoading,
  FlowStepCompleted,
} from '@/components/availability/FlowGuards';
import { useTokenVenues } from '@/hooks/useAvailabilityFlow';
import type { TokenVenuesView } from '@/types/availability';
import { usePlaceSelection } from './usePlaceSelection';

export default function TokenPlacesPage() {
  const { token } = useParams<{ token: string }>();
  return (
    <PhoneShell>
      <PlacesContent token={token} />
    </PhoneShell>
  );
}

function PlacesContent({ token }: { token: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useTokenVenues(token);

  useEffect(() => {
    if (data?.step === 'AVAILABILITY') router.replace(`/availability/${token}`);
  }, [data?.step, token, router]);

  if (isLoading) return <FlowLoading label="Buscando lugares para tu cita..." />;
  if (isError) return <FlowLinkError />;
  if (data?.step === 'COMPLETED') return <FlowStepCompleted />;
  if (!data || data.step === 'AVAILABILITY') return null;

  return <PlacesPicker token={token} data={data} />;
}

function PlacesPicker({
  token,
  data,
}: {
  token: string;
  data: Extract<TokenVenuesView, { step: 'VENUE' }>;
}) {
  const { selectedIds, formError, toggle, onConfirm, isPending } =
    usePlaceSelection(token, data);

  return (
    <>
      <div className="mb-6 flex flex-col items-center gap-5 text-center">
        <Logo />
        <div>
          <h1 className="heading text-ink text-4xl">Elegí los lugares</h1>
          <p className="text-ink-2 mt-2 text-sm">
            {data.partnerName
              ? `Opciones que van con lo que a vos y a ${data.partnerName} les gusta.`
              : 'Opciones que van con sus intereses.'}{' '}
            Elegí {data.minSelection} de {data.venues.length}.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {data.venues.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={venue}
            selected={selectedIds.includes(venue.id)}
            onToggle={() => toggle(venue.id)}
          />
        ))}
      </div>

      {formError && <p className="text-error mt-4 text-sm">{formError}</p>}

      <div className="mt-6">
        <Button className="w-full" disabled={isPending} onClick={onConfirm}>
          {isPending
            ? 'Guardando...'
            : `Confirmar (${selectedIds.length}/${data.minSelection})`}
        </Button>
      </div>
    </>
  );
}
