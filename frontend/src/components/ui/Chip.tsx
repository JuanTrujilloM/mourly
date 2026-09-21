export function Chip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`inline-flex h-9 items-center rounded-[13px] border px-3.5 text-[13.5px] font-[550] transition duration-(--dur-fast) ${
        selected
          ? 'border-accent-line bg-accent-tint text-magenta-300'
          : 'border-line bg-surface text-ink hover:border-ink-3'
      }`}
    >
      {label}
    </button>
  );
}
