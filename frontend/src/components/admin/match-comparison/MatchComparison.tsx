import { formatDate } from '@/lib/utils/format';
import type { AdminMatchDetail } from '@/types/admin';
import { AvailabilityList } from './AvailabilityList';
import { Compatibility } from './Compatibility';
import { PreferencesTable } from './PreferencesTable';
import { UserCard } from './UserCard';
import { Section, SelectPill } from './primitives';
import { FeedbackSection } from './FeedbackSection';

export function MatchComparison({ match }: { match: AdminMatchDetail }) {
  const shared = new Set(match.sharedHobbies.map((h) => h.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UserCard user={match.userA} shared={shared} />
        <UserCard user={match.userB} shared={shared} />
      </div>

      <Compatibility match={match} />

      <PreferencesTable a={match.userA} b={match.userB} />

      {match.venueOptions.length > 0 && (
        <Section title="Lugares sugeridos (HU-06)">
          <div className="space-y-2">
            {match.venueOptions.map((option) => (
              <div
                key={option.venueName}
                className="bg-surface-2 rounded-input flex items-center justify-between gap-3 px-3 py-2"
              >
                <div>
                  <span className="text-ink text-sm">{option.venueName}</span>
                  <span className="text-ink-2 ml-2 text-xs">{option.type}</span>
                </div>
                <div className="flex gap-2">
                  <SelectPill label="A" on={option.userASelected} />
                  <SelectPill label="B" on={option.userBSelected} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Disponibilidad (HU-09)">
        <div className="grid grid-cols-2 gap-4">
          <AvailabilityList
            name={match.userA.name}
            slots={match.availability.userA}
          />
          <AvailabilityList
            name={match.userB.name}
            slots={match.availability.userB}
          />
        </div>
      </Section>

      {match.date && (
        <Section title="Cita confirmada (HU-08)">
          <p className="text-ink text-sm">{match.date.venueName}</p>
          <p className="text-ink-2 mt-0.5 text-xs">{match.date.address}</p>
          <p className="text-ink-2 mt-1 text-xs">
            {formatDate(match.date.scheduledAt)} · {match.date.status}
          </p>
        </Section>
      )}

      <FeedbackSection feedback={match.feedback} />
    </div>
  );
}
