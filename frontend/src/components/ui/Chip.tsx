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
      className={`inline-flex h-8 items-center rounded-full border px-3 text-[13.5px] font-[550] transition duration-(--dur-fast) ${
        selected
          ? 'border-ink bg-ink text-page'
          : 'border-line bg-surface text-ink hover:border-ink-2'
      }`}
    >
      {label}
    </button>
  );
}
