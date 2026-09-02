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
      description={`Agrega de 1 a ${maxPhotos} fotos. La primera es tu foto principal.`}
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
                    className="border-white/15 text-slate hover:border-cyan/40 hover:text-cyan flex aspect-square items-center justify-center rounded-xl border border-dashed text-2xl transition"
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

              {error && <p className="text-blush text-xs">{error}</p>}
            </div>
          );
        }}
      />
    </Card>
  );
}
