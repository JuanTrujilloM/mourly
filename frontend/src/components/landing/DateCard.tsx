import Image from 'next/image';
import { buttonClasses } from '@/components/ui/Button';
import valentina from '@/assets/landing/valentina.jpg';

// Specimen of the confirmed-date card from the brand guide. Decorative: the
// buttons are painted, not wired, so they stay out of the tab order. The
// portrait is a generated face and the card says "Ejemplo": a dating site
// must not pass an invented person off as a user.
export function DateCard() {
  return (
    <div className="bg-surface border-line rounded-card mx-auto w-full max-w-sm border p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <span className="label text-ink-3 border-line rounded-full border px-2 py-0.5">
            Ejemplo
          </span>
          <span className="label text-ink-3">Tu cita · esta semana</span>
        </span>
        <span className="text-live inline-flex items-center gap-1.5 text-[12.5px] font-semibold">
          <span aria-hidden className="bg-live h-[7px] w-[7px] rounded-full" />
          Reserva lista
        </span>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Image
          src={valentina}
          alt="Valentina, retrato de ejemplo (persona generada, no es una usuaria)"
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-full object-cover"
        />
        <div>
          <p className="human text-ink text-[30px]">Valentina, 21</p>
          <p className="text-ink-2 mt-1 text-sm">
            Diseño · UPB · a 12 min de EAFIT
          </p>
        </div>
      </div>

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
