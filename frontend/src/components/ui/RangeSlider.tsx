'use client';

export function RangeSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: { min: number; max: number };
  onChange: (next: { min: number; max: number }) => void;
}) {
  const setMin = (next: number) =>
    onChange({ ...value, min: Math.min(next, value.max - 1) });
  const setMax = (next: number) =>
    onChange({ ...value, max: Math.max(next, value.min + 1) });

  const toPercent = (n: number) => ((n - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-slate text-sm">Rango de edad</span>
        <span className="text-cyan text-sm font-semibold">
          {value.min} – {value.max} años
        </span>
      </div>

      <div className="relative h-6">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white/10" />
        <div
          className="bg-cyan absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full"
          style={{
            left: `${toPercent(value.min)}%`,
            right: `${100 - toPercent(value.max)}%`,
          }}
        />
        <input
          type="range"
          className="brand-range absolute top-1/2 h-6 w-full -translate-y-1/2"
          min={min}
          max={max}
          value={value.min}
          onChange={(event) => setMin(Number(event.target.value))}
          aria-label="Edad mínima"
        />
        <input
          type="range"
          className="brand-range absolute top-1/2 h-6 w-full -translate-y-1/2"
          min={min}
          max={max}
          value={value.max}
          onChange={(event) => setMax(Number(event.target.value))}
          aria-label="Edad máxima"
        />
      </div>
    </div>
  );
}
