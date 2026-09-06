'use client';

import { useEffect, useRef, type ReactNode } from 'react';

// Native <dialog> so focus trapping, Esc and inertness come from the platform.
export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-label={title}
      className="bg-surface text-ink rounded-card m-auto w-[min(28rem,calc(100vw-2rem))] p-0 backdrop:bg-black/40"
    >
      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="subheading text-ink text-[22px]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-ink-3 hover:text-ink text-lg leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
