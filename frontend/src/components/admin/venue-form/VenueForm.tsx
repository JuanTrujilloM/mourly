"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { venueSchema, type VenueValues } from "@/lib/validation/venue";
import { useCreateVenue } from "@/hooks/useCreateVenue";
import { useUpdateVenue } from "@/hooks/useUpdateVenue";
import { getApiErrorMessage } from "@/lib/utils/errors";
import type { Venue } from "@/types/venue";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VenueDetailsFields } from "./VenueDetailsFields";
import { VenueCommercialFields } from "./VenueCommercialFields";
import { venueFormDefaults } from "./venue-form-defaults";

export function VenueForm({
  venue,
  onDone,
  onCancel,
}: {
  venue?: Venue;
  onDone: () => void;
  onCancel: () => void;
}) {
  const create = useCreateVenue();
  const update = useUpdateVenue();

  const form = useForm<VenueValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: venueFormDefaults(venue),
  });
  const { errors } = form.formState;
  const pending = create.isPending || update.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (venue) await update.mutateAsync({ id: venue.id, payload: values });
      else await create.mutateAsync(values);
      onDone();
    } catch (error) {
      form.setError("root", { message: getApiErrorMessage(error) });
    }
  });
  return (
    <Card
      title={venue ? "Editar lugar" : "Nuevo lugar"}
      description="Los lugares activos alimentan las sugerencias de los estudiantes."
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <VenueDetailsFields form={form} />
        <VenueCommercialFields form={form} />

        {errors.root && (
          <p className="text-blush text-sm">{errors.root.message}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando..." : venue ? "Guardar" : "Crear"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
