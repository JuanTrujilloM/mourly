import { daysAgo, daysFromNow } from '../helpers';
import { MatchSeed } from '../types';

export const ACTIVE_MATCHES: MatchSeed[] = [
  {
    id: 'match-conf-valentina-santiago',
    a: 'valentina',
    b: 'santiago',
    compatibilityScore: 9.1,
    status: 'confirmed',
    createdAt: daysAgo(2),
    venueOptionIds: ['venue-pergamino', 'venue-velvet', 'venue-mamm'],
    aSelected: ['venue-pergamino', 'venue-velvet'],
    bSelected: ['venue-pergamino', 'venue-mamm'],
    availability: { date: daysFromNow(3), slots: ['15:00', '16:00'] },
    date: {
      venueId: 'venue-pergamino',
      scheduledAt: daysFromNow(3),
      status: 'confirmed',
    },
  },
  {
    id: 'match-pend-mateo-isabella',
    a: 'mateo',
    b: 'isabella',
    compatibilityScore: 7.4,
    status: 'pending',
    createdAt: daysAgo(1),
    venueOptionIds: ['venue-velvet', 'venue-crepes-vegas', 'venue-cine-tesoro'],
    availability: { date: daysFromNow(4), slots: ['17:00'] },
  },
  {
    id: 'match-pend-sebastian-daniela',
    a: 'sebastian',
    b: 'daniela',
    compatibilityScore: 8.2,
    status: 'pending',
    createdAt: daysAgo(1),
    venueOptionIds: [
      'venue-sanalberto-bog',
      'venue-libelula-bog',
      'venue-parque93-bog',
    ],
    aSelected: ['venue-sanalberto-bog', 'venue-libelula-bog'],
    availability: { date: daysFromNow(5), slots: ['14:00', '15:00'] },
  },
  {
    id: 'match-cancel-tomas-camila',
    a: 'tomas',
    b: 'camila',
    compatibilityScore: 6.1,
    status: 'canceled',
    createdAt: daysAgo(9),
  },
];
