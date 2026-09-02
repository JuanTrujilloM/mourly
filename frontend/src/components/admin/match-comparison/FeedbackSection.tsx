import { Badge } from '@/components/admin/StatusBadge';
import { formatCOP } from '@/lib/utils/format';
import type { AdminMatchFeedback } from '@/types/admin';
import { Section } from './primitives';

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
          <div key={entry.userName} className="rounded-xl bg-white/[0.03] p-3">
            <div className="flex items-center justify-between">
              <span className="text-cream text-sm font-medium">
                {entry.userName}
              </span>
              {entry.occurred ? (
                <Badge label="Asistió" tone="green" />
              ) : (
                <Badge label="No asistió" tone="blush" />
              )}
            </div>
            {entry.rating != null && (
              <p className="text-gold mt-1 text-sm">
                {'★'.repeat(entry.rating)}
                <span className="text-white/15">
                  {'★'.repeat(5 - entry.rating)}
                </span>
              </p>
            )}
            <p className="text-slate mt-1 text-xs">
              {entry.comments ?? entry.noShowReason ?? '—'}
              {entry.amountSpent != null && ` · ${formatCOP(entry.amountSpent)}`}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
