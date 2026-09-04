import { Badge } from '@/components/admin/StatusBadge';
import { formatCOP } from '@/lib/utils/format';
import type { AdminMatchFeedback } from '@/types/admin';
import { Section, Stars } from './primitives';

export function FeedbackSection({
  feedback,
}: {
  feedback: AdminMatchFeedback[];
}) {
  if (feedback.length === 0) {
    return null;
  }

  return (
    <Section title="Feedback (HU-10)">
      <div className="space-y-3">
        {feedback.map((entry) => (
          <div key={entry.userName} className="bg-surface-2 rounded-input p-3">
            <div className="flex items-center justify-between">
              <span className="text-ink text-sm font-medium">
                {entry.userName}
              </span>
              {entry.occurred ? (
                <Badge label="Asistió" tone="live" />
              ) : (
                <Badge label="No asistió" tone="error" />
              )}
            </div>
            {entry.rating != null && (
              <p className="mt-1 text-sm">
                <Stars rating={entry.rating} />
              </p>
            )}
            <p className="text-ink-2 mt-1 text-xs">
              {entry.comments ?? entry.noShowReason ?? '—'}
              {entry.amountSpent != null && ` · ${formatCOP(entry.amountSpent)}`}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
