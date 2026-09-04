"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import type { VenueValues } from "@/lib/validation/venue";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { TagInput } from "@/components/ui/TagInput";
import { Chip } from "@/components/ui/Chip";

export function VenueCommercialFields({
  form,
}: {
  form: UseFormReturn<VenueValues>;
}) {
  const { errors } = form.formState;

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Comisión (0–1)" error={errors.commissionRate?.message}>
          <Input
            type="number"
            step="0.01"
            min="0"
            max="1"
            hasError={Boolean(errors.commissionRate)}
            {...form.register("commissionRate", { valueAsNumber: true })}
          />
        </Field>
        <Field
          label="Gasto prom. (COP)"
          error={errors.averageSpentPerPerson?.message}
        >
          <Input
            type="number"
            step="1000"
            min="0"
            hasError={Boolean(errors.averageSpentPerPerson)}
            {...form.register("averageSpentPerPerson", {
              valueAsNumber: true,
            })}
          />
        </Field>
      </div>

      <Field label="Etiquetas de interés" error={errors.tags?.message}>
        <Controller
          control={form.control}
          name="tags"
          render={({ field }) => (
            <TagInput
              value={field.value}
              onChange={field.onChange}
              placeholder="café, cine, naturaleza..."
            />
          )}
        />
      </Field>

      <Controller
        control={form.control}
        name="active"
        render={({ field }) => (
          <Chip
            label={field.value ? "Activo" : "Inactivo"}
            selected={field.value}
            onToggle={() => field.onChange(!field.value)}
          />
        )}
      />
    </>
  );
}
