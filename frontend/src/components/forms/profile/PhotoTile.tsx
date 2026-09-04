'use client';

import type { ProfilePhoto } from '@/types/profile';

export function PhotoTile({
  photo,
  index,
  onRemove,
  onDragStart,
  onDrop,
}: {
  photo: ProfilePhoto;
  index: number;
  onRemove: () => void;
  onDragStart: () => void;
  onDrop: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className="group border-line rounded-input relative aspect-square cursor-grab overflow-hidden border active:cursor-grabbing"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={`Foto ${index + 1}`}
        className="h-full w-full object-cover"
      />
      {index === 0 && (
        <span className="bg-ink text-page rounded-chip-inner absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-semibold">
          Principal
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Quitar foto"
        className="bg-ink text-page absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
