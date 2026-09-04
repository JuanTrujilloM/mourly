import { buttonClasses } from '@/components/ui/Button';

// Specimen of the confirmed-date card from the brand guide. Decorative: the
// buttons are painted, not wired, so they stay out of the tab order.
export function DateCard() {
  return (
    <div className="bg-surface border-line rounded-card mx-auto w-full max-w-sm border p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <span className="label text-ink-3">Tu cita · esta semana</span>
        <span className="text-live inline-flex items-center gap-1.5 text-[12.5px] font-semibold">
          <span aria-hidden className="bg-live h-[7px] w-[7px] rounded-full" />
          Reserva lista
        </span>
      </div>

      <p className="human text-ink mt-6 text-[30px]">Valentina, 21</p>
      <p className="text-ink-2 mt-1 text-sm">Diseño · UPB · a 12 min de EAFIT</p>

      <div className="border-line mt-6 border-t pt-5">
        <p className="subheading text-ink text-[28px] tabular-nums">
          Jueves 6:00 pm
        </p>
        <p className="text-ink-2 mt-1 text-sm">
          Converso · Cra. 37 con 8A, Provenza
        </p>
      </div>

      <div aria-hidden className="mt-6 flex gap-2">
        <span className={buttonClasses('primary', 'sm')}>Confirmar</span>
        <span className={buttonClasses('ghost', 'sm')}>Cambiar hora</span>
      </div>
    </div>
  );
}
