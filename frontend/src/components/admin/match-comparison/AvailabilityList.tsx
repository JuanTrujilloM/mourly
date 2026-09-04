import { formatCalendarDate } from '@/lib/utils/format';

export function AvailabilityList({
  name,
  slots,
}: {
  name: string;
  slots: { date: string; timeSlot: string }[];
}) {
  return (
    <div>
      <p className="text-ink-2 mb-2 text-xs font-medium">{name}</p>
      {slots.length === 0 ? (
        <p className="text-ink-3 text-xs">Sin franjas seleccionadas</p>
      ) : (
        <ul className="space-y-1">
          {slots.map((slot, index) => (
            <li key={index} className="text-ink text-xs tabular-nums">
              {formatCalendarDate(slot.date)} · {slot.timeSlot}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
