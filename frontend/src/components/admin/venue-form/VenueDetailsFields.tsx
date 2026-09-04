"use client";

import type { UseFormReturn } from "react-hook-form";
import type { VenueValues } from "@/lib/validation/venue";
import { useCatalog } from "@/hooks/useCatalog";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export function VenueDetailsFields({
  form,
}: {
  form: UseFormReturn<VenueValues>;
}) {
  const { errors } = form.formState;
  const { venueTypes } = useCatalog();

  return (
    <>
      <Field label="Nombre" error={errors.name?.message}>
        <Input hasError={Boolean(errors.name)} {...form.register("name")} />
      </Field>

      <Field label="Tipo" error={errors.type?.message}>
        <Select hasError={Boolean(errors.type)} {...form.register("type")}>
          {venueTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Dirección" error={errors.address?.message}>
        <Input
          hasError={Boolean(errors.address)}
          {...form.register("address")}
        />
      </Field>

      <Field label="Horario" error={errors.openingHours?.message}>
        <Input
          placeholder="Lun-Dom 8:00-22:00"
          hasError={Boolean(errors.openingHours)}
          {...form.register("openingHours")}
        />
      </Field>

      <Field label="Descripción" error={errors.description?.message}>
        <Textarea
          rows={3}
          hasError={Boolean(errors.description)}
          {...form.register("description")}
        />
      </Field>
    </>
  );
}
