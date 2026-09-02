import type { AdminMatchDetail } from '@/types/admin';
import { Section, Signal } from './primitives';

export function Compatibility({ match }: { match: AdminMatchDetail }) {
  const a = match.userA;
  const b = match.userB;
  const pa = a.preferences;
  const pb = b.preferences;

  const sameUniversity = a.university === b.university;
  const relationshipAligned =
    pa != null &&
    pb != null &&
    (pa.relationshipType === pb.relationshipType ||
      pa.relationshipType === 'Abierto a todo' ||
      pb.relationshipType === 'Abierto a todo');
  const ageOk =
    pa != null &&
    pb != null &&
    a.age != null &&
    b.age != null &&
    b.age >= pa.minAge &&
    b.age <= pa.maxAge &&
    a.age >= pb.minAge &&
    a.age <= pb.maxAge;

  return (
    <Section title="Compatibilidad">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-slate text-sm">Score del algoritmo:</span>
        <span className="text-cyan text-2xl font-bold">
          {match.compatibilityScore.toFixed(1)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Signal ok={match.sharedHobbies.length > 0}>
          {match.sharedHobbies.length} interés(es) en común
        </Signal>
        <Signal ok={ageOk}>Edad dentro del rango mutuo</Signal>
        <Signal ok={relationshipAligned}>Tipo de relación compatible</Signal>
        <Signal ok={sameUniversity} neutral={!sameUniversity}>
          {sameUniversity ? 'Misma universidad' : 'Universidades distintas'}
        </Signal>
      </div>

      {match.sharedHobbies.length > 0 && (
        <div className="mt-4">
          <p className="text-slate mb-2 text-xs font-semibold tracking-wide uppercase">
            Intereses compartidos
          </p>
          <div className="flex flex-wrap gap-1.5">
            {match.sharedHobbies.map((hobby) => (
              <span
                key={hobby}
                className="bg-cyan/15 text-cyan rounded-full px-2.5 py-0.5 text-xs font-medium"
              >
                {hobby}
              </span>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
