'use client';

import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

const TITLE = 'Alcanzaste el máximo de reenvíos';

export function ResendLimitDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title={TITLE} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-ink-2 text-sm">
          Ya te mandamos varios códigos. Revisá tu bandeja de entrada y la
          carpeta de spam: el último sigue sirviendo.
        </p>
        <p className="text-ink-2 text-sm">
          Si no te llegó ninguno, esperá unos minutos y volvé a pedirlo.
        </p>

        <Button type="button" className="w-full" onClick={onClose}>
          Entendido
        </Button>

        <p className="text-ink-2 text-center text-xs">
          ¿Te equivocaste de correo?{' '}
          <Link href="/login" className="text-accent-text underline">
            Empezá de nuevo
          </Link>
        </p>
      </div>
    </Modal>
  );
}
