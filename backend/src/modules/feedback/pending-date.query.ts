export const PENDING_DATE_SELECT = {
  id: true,
  scheduledAt: true,
  feedbackRequestedAt: true,
  feedbackReminderAt: true,
  venue: { select: { name: true } },
  feedbacks: { select: { userId: true } },
  match: {
    select: {
      userA: {
        select: {
          id: true,
          email: true,
          cellphone: true,
          profile: { select: { name: true } },
        },
      },
      userB: {
        select: {
          id: true,
          email: true,
          cellphone: true,
          profile: { select: { name: true } },
        },
      },
    },
  },
};
