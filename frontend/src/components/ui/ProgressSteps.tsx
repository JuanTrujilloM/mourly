export function ProgressSteps({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="label text-ink-3">
          Paso {current} de {total}
        </span>
        <span className="text-ink-3 text-xs">{label}</span>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={`h-1 flex-1 rounded-full transition ${
              index < current ? 'bg-ink' : 'bg-line'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
