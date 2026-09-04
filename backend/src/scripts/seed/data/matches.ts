import { MatchSeed } from '../types';
import { ACTIVE_MATCHES } from './matches-active';
import { COMPLETED_MATCHES } from './matches-completed';

export const MATCHES: MatchSeed[] = [...ACTIVE_MATCHES, ...COMPLETED_MATCHES];
