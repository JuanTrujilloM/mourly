const STEPS = [
  {
    title: 'Correo de tu u',
    description: 'Te llega un código de 6 dígitos. Con eso entrás o creás tu cuenta.',
  },
  {
    title: 'Tu celular',
    description: 'Por SMS te avisamos de tu match y de tu cita.',
  },
  {
    title: 'Tu perfil',
    description: 'Cinco minutos y entrás a la ronda del jueves, 7:00 pm.',
  },
];

// What comes after this screen, printed like the back of a carné. `current`
// is 1-based; earlier steps read as done.
export function EntrySteps({
  current,
  className = '',
}: {
  current: number;
  className?: string;
}) {
  return (
    <section
      aria-label="Pasos para entrar"
      className={`border-line bg-surface rounded-card inset-shadow-glass border p-5 ${className}`}
    >
      <p className="label text-ink-3">Solo con carné · EAFIT · UPB · CES · EIA</p>
      <ol className="mt-4 space-y-4">
        {STEPS.map((step, index) => {
          const number = index + 1;
          const isCurrent = number === current;
          const isDone = number < current;
          return (
            <li
              key={step.title}
              aria-current={isCurrent ? 'step' : undefined}
              className="flex gap-3.5"
            >
              <span
                className={`label mt-0.5 w-6 shrink-0 ${
                  isCurrent ? 'text-accent-text' : 'text-ink-3'
                }`}
              >
                0{number}
              </span>
              <div>
                <p
                  className={`text-[15px] font-semibold ${
                    isCurrent ? 'text-ink' : 'text-ink-2'
                  } ${isDone ? 'line-through decoration-1' : ''}`}
                >
                  {step.title}
                </p>
                <p className="text-ink-3 mt-0.5 text-[13px] leading-snug">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
