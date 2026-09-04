'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { VenueForm } from '@/components/admin/VenueForm';
import { useVenues } from '@/hooks/useVenues';
import { useUpdateVenue } from '@/hooks/useUpdateVenue';
import type { Venue } from '@/types/venue';
import { venueColumns } from './venueColumns';

type Editing = Venue | 'new' | null;

export default function AdminVenuesPage() {
  const { data: venues, isLoading, isError } = useVenues();
  const update = useUpdateVenue();
  const [editing, setEditing] = useState<Editing>(null);

  const togglingId =
    update.isPending && update.variables ? update.variables.id : null;

  const columns = venueColumns(
    (venue) => setEditing(venue),
    (venue, active) => update.mutate({ id: venue.id, payload: { active } }),
    togglingId,
  );

  if (editing) {
    return (
      <VenueForm
        venue={editing === 'new' ? undefined : editing}
        onDone={() => setEditing(null)}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Lugares"
        description="Los lugares activos alimentan las sugerencias de los estudiantes."
        action={<Button onClick={() => setEditing('new')}>Nuevo lugar</Button>}
      />

      <DataTable
        columns={columns}
        rows={venues}
        rowKey={(venue) => venue.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="Todavía no hay lugares."
      />
    </>
  );
}
