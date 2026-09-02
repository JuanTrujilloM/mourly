import type { AdminPreferences, AdminUserDetail } from '@/types/admin';
import { Section } from './primitives';

export function PreferencesTable({
  a,
  b,
}: {
  a: AdminUserDetail;
  b: AdminUserDetail;
}) {
  if (!a.preferences || !b.preferences) return null;
  const rows: { label: string; key: keyof AdminPreferences }[] = [
    { label: 'Busca', key: 'relationshipType' },
    { label: 'Orientación', key: 'orientation' },
    { label: 'Interés de género', key: 'genderInterest' },
    { label: 'Rango de edad', key: 'minAge' },
    { label: 'Preferencia de estatura', key: 'heightRange' },
    { label: 'Energía / vibe', key: 'energyVibe' },
    { label: 'Misma universidad', key: 'sameUniversity' },
  ];

  const render = (prefs: AdminPreferences, key: keyof AdminPreferences) => {
    if (key === 'minAge') return `${prefs.minAge}–${prefs.maxAge}`;
    if (key === 'sameUniversity') return prefs.sameUniversity ? 'Sí' : 'No';
    return String(prefs[key]);
  };

  return (
    <Section title="Preferencias">
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="text-slate px-4 py-2 text-xs font-semibold">
                {a.name}
              </th>
              <th className="text-slate px-4 py-2 text-center text-xs font-semibold">
                Campo
              </th>
              <th className="text-slate px-4 py-2 text-right text-xs font-semibold">
                {b.name}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className="border-b border-white/5 last:border-0"
              >
                <td className="text-cream px-4 py-2">
                  {render(a.preferences!, row.key)}
                </td>
                <td className="text-slate px-4 py-2 text-center text-xs">
                  {row.label}
                </td>
                <td className="text-cream px-4 py-2 text-right">
                  {render(b.preferences!, row.key)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
