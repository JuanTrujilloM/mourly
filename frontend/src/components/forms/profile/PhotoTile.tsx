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
      className="group border-white/10 relative aspect-square cursor-grab overflow-hidden rounded-xl border active:cursor-grabbing"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={`Foto ${index + 1}`}
        className="h-full w-full object-cover"
      />
      {index === 0 && (
        <span className="bg-gold text-navy-deep absolute left-1 top-1 rounded px-1.5 py-0.5 text-[10px] font-bold">
          Principal
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Quitar foto"
        className="bg-navy-deep/80 text-cream absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs opacity-0 transition group-hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
