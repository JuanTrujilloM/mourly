import { daysAgo } from '../helpers';
import { MatchSeed } from '../types';

export const COMPLETED_MATCHES: MatchSeed[] = [
  {
    id: 'match-done-felipe-miguel',
    a: 'felipe',
    b: 'miguel',
    compatibilityScore: 8.8,
    status: 'completed',
    createdAt: daysAgo(16),
    date: {
      venueId: 'venue-mamm',
      scheduledAt: daysAgo(12),
      status: 'completed',
      feedback: [
        {
          user: 'felipe',
          occurred: true,
          rating: 5,
          comments: 'Conversación increíble, repetiría sin dudarlo.',
          amountSpent: 46000,
        },
        {
          user: 'miguel',
          occurred: true,
          rating: 5,
          comments: 'Muy buena química, el lugar fue perfecto.',
          amountSpent: 44000,
        },
      ],
    },
  },
  {
    id: 'match-done-sara-manuela',
    a: 'sara',
    b: 'manuela',
    compatibilityScore: 7.9,
    status: 'completed',
    createdAt: daysAgo(23),
    date: {
      venueId: 'venue-velvet',
      scheduledAt: daysAgo(19),
      status: 'completed',
      feedback: [
        {
          user: 'sara',
          occurred: false,
          noShowReason: 'La otra persona no llegó y no avisó.',
        },
        {
          user: 'manuela',
          occurred: false,
          noShowReason: 'Tuve una emergencia familiar de último momento.',
        },
      ],
    },
  },
  {
    id: 'match-done-nicolas-sofia',
    a: 'nicolas',
    b: 'sofia',
    compatibilityScore: 8.5,
    status: 'completed',
    createdAt: daysAgo(30),
    date: {
      venueId: 'venue-presidenta',
      scheduledAt: daysAgo(26),
      status: 'completed',
      feedback: [
        {
          user: 'nicolas',
          occurred: true,
          rating: 4,
          comments: 'Buen plan al aire libre, la pasamos bien.',
          amountSpent: 18000,
        },
      ],
    },
  },
];
