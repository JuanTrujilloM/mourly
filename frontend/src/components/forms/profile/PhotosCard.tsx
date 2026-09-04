'use client';

import { useRef, useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import type { ProfileValues } from '@/lib/validation/profile';
import { useCatalog } from '@/hooks/useCatalog';
import { buildPhotoListActions } from './photo-list-actions';
import { PhotoTile } from './PhotoTile';
import { Card } from '@/components/ui/Card';

export function PhotosCard({ form }: { form: UseFormReturn<ProfileValues> }) {
  const {
    bounds: { maxPhotos },
  } = useCatalog();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const error = form.formState.errors.photos?.message;

  return (
    <Card
      title="Tus fotos"
      description={`Agregá de 1 a ${maxPhotos} fotos, sin filtros. La primera es la principal.`}
    >
      <Controller
        control={form.control}
        name="photos"
        render={({ field }) => {
          const photos = field.value;

          const { addFiles, removeAt, reorder } = buildPhotoListActions(
            photos,
            maxPhotos,
            field.onChange,
          );

          return (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {photos.map((photo, index) => (
                  <PhotoTile
                    key={photo.id}
                    photo={photo}
                    index={index}
                    onRemove={() => removeAt(index)}
                    onDragStart={() => setDragIndex(index)}
                    onDrop={() => {
                      if (dragIndex !== null && dragIndex !== index) {
                        reorder(dragIndex, index);
                      }
                      setDragIndex(null);
                    }}
                  />
                ))}

                {photos.length < maxPhotos && (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    aria-label="Agregar foto"
                    className="border-line text-ink-2 hover:border-ink hover:text-ink rounded-input flex aspect-square items-center justify-center border border-dashed text-2xl transition"
                  >
                    +
                  </button>
                )}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={addFiles}
              />

              {error && <p className="text-error text-xs">{error}</p>}
            </div>
          );
        }}
      />
    </Card>
  );
}
